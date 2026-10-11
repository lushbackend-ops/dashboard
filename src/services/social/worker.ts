import { createClient } from '@/utils/supabase/server';
import { decryptToken } from './crypto';
import { MetaPublisherAdapter } from './adapters/metaAdapter';
import { LinkedInPublisherAdapter } from './adapters/linkedinAdapter';
import { SocialPost, SocialPublishResult, SocialPlatformType } from './types';

export interface WorkerProcessSummary {
  postsClaimed: number;
  publishedCount: number;
  partialCount: number;
  failedCount: number;
  processedIds: string[];
}

/**
 * Executes publishing for a single post across all its specified platform targets.
 */
export async function processPostPublishing(post: SocialPost): Promise<{
  results: SocialPublishResult[];
  overallStatus: 'PUBLISHED' | 'PARTIALLY_PUBLISHED' | 'FAILED';
}> {
  const supabase = await createClient();
  const results: SocialPublishResult[] = [];

  // Fetch targets and connected accounts
  const { data: targets, error: targetsError } = await supabase
    .from('social_post_targets')
    .select(`
      id,
      platform,
      account_id,
      status,
      attempt_count,
      social_connected_accounts (
        id,
        platform,
        account_name,
        account_id,
        encrypted_access_token,
        status
      )
    `)
    .eq('post_id', post.id);

  if (targetsError || !targets || targets.length === 0) {
    return {
      results: [{
        platform: 'FACEBOOK_PAGE',
        success: false,
        errorCode: 'NO_TARGETS_FOUND',
        errorMessage: 'Post has no valid target platforms configured.'
      }],
      overallStatus: 'FAILED'
    };
  }

  for (const target of targets) {
    const rawAccount = (target as any).social_connected_accounts;
    const platform = target.platform as SocialPlatformType;

    // Check account validity
    if (!rawAccount || rawAccount.status !== 'ACTIVE') {
      const errRes: SocialPublishResult = {
        platform,
        success: false,
        errorCode: 'ACCOUNT_DISCONNECTED',
        errorMessage: `Target account for ${platform} is not connected or active.`
      };
      results.push(errRes);

      // Record failure in target and log
      await supabase
        .from('social_post_targets')
        .update({
          status: 'FAILED',
          attempt_count: (target.attempt_count || 0) + 1,
          last_attempt_at: new Date().toISOString(),
          error_code: errRes.errorCode,
          error_message: errRes.errorMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', target.id);

      await supabase.from('social_publish_logs').insert({
        target_id: target.id,
        attempt_number: (target.attempt_count || 0) + 1,
        status: 'FAILED',
        safe_details: { error: errRes.errorMessage }
      });
      continue;
    }

    const decryptedToken = decryptToken(rawAccount.encrypted_access_token);
    let pubResult: SocialPublishResult;

    // Mark target as PROCESSING
    await supabase
      .from('social_post_targets')
      .update({
        status: 'PROCESSING',
        attempt_count: (target.attempt_count || 0) + 1,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', target.id);

    // Call platform adapter
    if (platform === 'FACEBOOK_PAGE') {
      pubResult = await MetaPublisherAdapter.publishToFacebookPage(
        rawAccount.account_id,
        decryptedToken,
        post.caption,
        post.media_items || []
      );
    } else if (platform === 'INSTAGRAM') {
      pubResult = await MetaPublisherAdapter.publishToInstagram(
        rawAccount.account_id,
        decryptedToken,
        post.caption,
        post.media_items || []
      );
    } else if (platform === 'LINKEDIN_ORG') {
      pubResult = await LinkedInPublisherAdapter.publishToOrganizationPage(
        rawAccount.account_id,
        decryptedToken,
        post.caption,
        post.media_items || []
      );
    } else {
      pubResult = {
        platform,
        success: false,
        errorCode: 'UNSUPPORTED_PLATFORM',
        errorMessage: `Platform ${platform} adapter not found.`
      };
    }

    results.push(pubResult);

    // Save target outcome
    await supabase
      .from('social_post_targets')
      .update({
        status: pubResult.success ? 'SUCCESS' : (pubResult.requiresAttention ? 'NEEDS_ATTENTION' : 'FAILED'),
        remote_post_id: pubResult.remotePostId || null,
        error_code: pubResult.errorCode || null,
        error_message: pubResult.errorMessage || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', target.id);

    // Record audit log
    await supabase.from('social_publish_logs').insert({
      target_id: target.id,
      attempt_number: (target.attempt_count || 0) + 1,
      status: pubResult.success ? 'SUCCESS' : (pubResult.requiresAttention ? 'NEEDS_ATTENTION' : 'FAILED'),
      safe_details: {
        remotePostId: pubResult.remotePostId || null,
        errorCode: pubResult.errorCode || null,
        errorMessage: pubResult.errorMessage || null
      }
    });
  }

  // Derive overall status
  const successCount = results.filter(r => r.success).length;
  let overallStatus: 'PUBLISHED' | 'PARTIALLY_PUBLISHED' | 'FAILED' = 'FAILED';

  if (successCount === results.length) {
    overallStatus = 'PUBLISHED';
  } else if (successCount > 0) {
    overallStatus = 'PARTIALLY_PUBLISHED';
  } else {
    overallStatus = 'FAILED';
  }

  return { results, overallStatus };
}

/**
 * Concurrency-safe background worker execution.
 * Finds due posts and claims them atomically using Postgres timestamp check.
 */
export async function runSocialSchedulerWorker(): Promise<WorkerProcessSummary> {
  const supabase = await createClient();
  const workerId = `worker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const leaseExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min lease

  const summary: WorkerProcessSummary = {
    postsClaimed: 0,
    publishedCount: 0,
    partialCount: 0,
    failedCount: 0,
    processedIds: []
  };

  try {
    // 1. Fetch eligible due posts
    const { data: eligiblePosts, error: fetchErr } = await supabase
      .from('social_posts')
      .select('id')
      .eq('status', 'SCHEDULED')
      .lte('scheduled_at', now)
      .or(`claim_expires_at.is.null,claim_expires_at.lt.${now}`)
      .limit(10);

    if (fetchErr || !eligiblePosts || eligiblePosts.length === 0) {
      return summary;
    }

    for (const item of eligiblePosts) {
      // 2. Atomic claim on each post
      const { data: claimed, error: claimErr } = await supabase
        .from('social_posts')
        .update({
          status: 'PUBLISHING',
          claim_worker_id: workerId,
          claim_expires_at: leaseExpiry,
          updated_at: now
        })
        .eq('id', item.id)
        .eq('status', 'SCHEDULED')
        .select('*')
        .single();

      if (claimErr || !claimed) {
        // Race condition: another concurrent worker claimed this item, skip
        continue;
      }

      summary.postsClaimed++;
      summary.processedIds.push(claimed.id);

      // Verify cancellation didn't slip through
      if (claimed.cancelled_at) {
        await supabase
          .from('social_posts')
          .update({
            status: 'CANCELLED',
            claim_worker_id: null,
            claim_expires_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', claimed.id);
        continue;
      }

      // 3. Process publication
      const { overallStatus } = await processPostPublishing(claimed as SocialPost);

      if (overallStatus === 'PUBLISHED') summary.publishedCount++;
      else if (overallStatus === 'PARTIALLY_PUBLISHED') summary.partialCount++;
      else summary.failedCount++;

      // 4. Update post final status and release claim
      await supabase
        .from('social_posts')
        .update({
          status: overallStatus,
          claim_worker_id: null,
          claim_expires_at: null,
          published_at: overallStatus !== 'FAILED' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', claimed.id);
    }
  } catch (err: any) {
    console.error('[SocialWorker] Error in worker execution loop:', err.message);
  }

  return summary;
}
