"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { SocialPlatformType, SocialPost, SocialConnectedAccount } from '@/services/social/types';
import { processPostPublishing } from '@/services/social/worker';

export interface CreatePostInput {
  caption: string;
  mediaItems: Array<{
    id: string;
    name: string;
    url: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
  }>;
  platforms: SocialPlatformType[];
  publishMode: 'NOW' | 'SCHEDULE';
  scheduledAtUtc?: string | null;
  displayTimezone?: string;
}

export async function getSocialPublisherData() {
  try {
    const supabase = await createClient();

    // 1. Fetch connected accounts (safely mask encrypted tokens)
    const { data: accounts, error: accError } = await supabase
      .from('social_connected_accounts')
      .select('id, platform, account_name, account_id, status, scopes, token_expires_at, updated_at, created_at')
      .order('created_at', { ascending: false });

    // 2. Fetch scheduled / recent posts with their targets
    const { data: posts, error: postsError } = await supabase
      .from('social_posts')
      .select(`
        id,
        caption,
        media_items,
        display_timezone,
        scheduled_at,
        status,
        published_at,
        cancelled_at,
        created_at,
        updated_at,
        social_post_targets (
          id,
          platform,
          status,
          remote_post_id,
          attempt_count,
          last_attempt_at,
          error_code,
          error_message,
          account_id
        )
      `)
      .order('created_at', { ascending: false });

    return {
      accounts: (accounts || []) as SocialConnectedAccount[],
      posts: (posts || []).map((p: any) => ({
        ...p,
        targets: p.social_post_targets || []
      })) as SocialPost[],
      errors: {
        accounts: accError?.message || null,
        posts: postsError?.message || null
      }
    };
  } catch (err: any) {
    console.error('Error fetching social publisher data:', err);
    return {
      accounts: [] as SocialConnectedAccount[],
      posts: [] as SocialPost[],
      errors: {
        accounts: err?.message || 'Server error loading accounts',
        posts: err?.message || 'Server error loading posts'
      }
    };
  }
}

export async function createSocialPost(input: CreatePostInput) {
  try {
    const supabase = await createClient();

    if (!input.caption || input.caption.trim().length === 0) {
      return { success: false, error: 'Caption cannot be empty.' };
    }

    if (!input.platforms || input.platforms.length === 0) {
      return { success: false, error: 'Please select at least one target platform.' };
    }

    // Validate schedule parameters
    let scheduledAtIso: string | null = null;
    let initialStatus: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' = 'DRAFT';

    if (input.publishMode === 'SCHEDULE') {
      if (!input.scheduledAtUtc) {
        return { success: false, error: 'A valid future date and time is required to schedule.' };
      }
      const scheduledDate = new Date(input.scheduledAtUtc);
      if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
        return { success: false, error: 'Scheduled time must be in the future.' };
      }
      scheduledAtIso = scheduledDate.toISOString();
      initialStatus = 'SCHEDULED';
    } else {
      initialStatus = 'PUBLISHING';
    }

    // 1. Insert master post
    const { data: post, error: postErr } = await supabase
      .from('social_posts')
      .insert({
        caption: input.caption.trim(),
        media_items: input.mediaItems || [],
        display_timezone: input.displayTimezone || 'Asia/Kolkata',
        scheduled_at: scheduledAtIso,
        status: initialStatus
      })
      .select()
      .single();

    if (postErr || !post) {
      return { success: false, error: postErr?.message || 'Failed to save post in database.' };
    }

    // 2. Fetch connected accounts for mapping
    const { data: accounts } = await supabase
      .from('social_connected_accounts')
      .select('id, platform')
      .eq('status', 'ACTIVE');

    const accountMap = new Map<SocialPlatformType, string>();
    accounts?.forEach((acc: any) => {
      accountMap.set(acc.platform as SocialPlatformType, acc.id);
    });

    // 3. Create target records
    const targetInserts = input.platforms.map(platform => ({
      post_id: post.id,
      platform,
      account_id: accountMap.get(platform) || null,
      status: 'PENDING'
    }));

    const { error: targetErr } = await supabase
      .from('social_post_targets')
      .insert(targetInserts);

    if (targetErr) {
      console.error('Target insert error:', targetErr);
    }

    // 4. If Publish Now, execute publishing adapter immediately
    if (input.publishMode === 'NOW') {
      const pubResult = await processPostPublishing(post as SocialPost);
      await supabase
        .from('social_posts')
        .update({
          status: pubResult.overallStatus,
          published_at: pubResult.overallStatus !== 'FAILED' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', post.id);

      try {
        revalidatePath('/social-publisher');
      } catch (revErr) {
        console.warn('revalidatePath non-critical warning:', revErr);
      }

      return {
        success: true,
        postId: post.id,
        publishedNow: true,
        overallStatus: pubResult.overallStatus,
        results: pubResult.results
      };
    }

    try {
      revalidatePath('/social-publisher');
    } catch (revErr) {
      console.warn('revalidatePath non-critical warning:', revErr);
    }

    return {
      success: true,
      postId: post.id,
      publishedNow: false,
      status: 'SCHEDULED'
    };
  } catch (err: any) {
    console.error('Unhandled error in createSocialPost:', err);
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while creating or publishing the post.'
    };
  }
}

export async function cancelScheduledPost(postId: string) {
  try {
    const supabase = await createClient();

    const { data: post, error: fetchErr } = await supabase
      .from('social_posts')
      .select('id, status')
      .eq('id', postId)
      .single();

    if (fetchErr || !post) {
      return { success: false, error: 'Post not found.' };
    }

    if (post.status !== 'SCHEDULED' && post.status !== 'DRAFT') {
      return { success: false, error: `Cannot cancel post with current status: ${post.status}` };
    }

    const { error: updateErr } = await supabase
      .from('social_posts')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    try {
      revalidatePath('/social-publisher');
    } catch (revErr) {
      console.warn('revalidatePath non-critical warning:', revErr);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Unhandled error in cancelScheduledPost:', err);
    return { success: false, error: err?.message || 'Failed to cancel post.' };
  }
}

export async function reschedulePost(postId: string, newScheduledAtUtc: string) {
  try {
    const supabase = await createClient();

    const scheduledDate = new Date(newScheduledAtUtc);
    if (isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
      return { success: false, error: 'Rescheduled date must be in the future.' };
    }

    const { error } = await supabase
      .from('social_posts')
      .update({
        scheduled_at: scheduledDate.toISOString(),
        status: 'SCHEDULED',
        cancelled_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/social-publisher');
    } catch (revErr) {
      console.warn('revalidatePath non-critical warning:', revErr);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Unhandled error in reschedulePost:', err);
    return { success: false, error: err?.message || 'Failed to reschedule post.' };
  }
}

export async function disconnectAccount(accountId: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('social_connected_accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/social-publisher');
    } catch (revErr) {
      console.warn('revalidatePath non-critical warning:', revErr);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Unhandled error in disconnectAccount:', err);
    return { success: false, error: err?.message || 'Failed to disconnect account.' };
  }
}

export async function connectAccountManually(
  platform: SocialPlatformType,
  accountName: string,
  accountId: string,
  accessToken: string
) {
  try {
    const supabase = await createClient();
    const { encryptToken } = await import('@/services/social/crypto');

    if (!accountName || !accountId || !accessToken) {
      return { success: false, error: 'All fields (Name, ID, and Access Token) are required.' };
    }

    const encrypted = encryptToken(accessToken.trim());

    const { error } = await supabase
      .from('social_connected_accounts')
      .upsert(
        {
          platform,
          account_name: accountName.trim(),
          account_id: accountId.trim(),
          encrypted_access_token: encrypted,
          status: 'ACTIVE',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'platform,account_id' }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/social-publisher');
    } catch (revErr) {
      console.warn('revalidatePath non-critical warning:', revErr);
    }
    return { success: true };
  } catch (err: any) {
    console.error('Unhandled error in connectAccountManually:', err);
    return { success: false, error: err?.message || 'Failed to save account.' };
  }
}

export async function deleteSocialPost(postId: string, deleteFromPlatforms = true) {
  try {
    const supabase = await createClient();
    const { decryptToken } = await import('@/services/social/crypto');
    const { MetaPublisherAdapter } = await import('@/services/social/adapters/metaAdapter');
    const { LinkedInPublisherAdapter } = await import('@/services/social/adapters/linkedinAdapter');

    const deletionErrors: string[] = [];

    // 1. Fetch post targets and connected accounts to clean up remote published posts
    if (deleteFromPlatforms) {
      const { data: targets } = await supabase
        .from('social_post_targets')
        .select(`
          id,
          platform,
          remote_post_id,
          social_connected_accounts (
            id,
            encrypted_access_token
          )
        `)
        .eq('post_id', postId);

      if (targets && targets.length > 0) {
        for (const t of targets) {
          if (t.remote_post_id) {
            const rawAccount = (t as any).social_connected_accounts;
            if (rawAccount?.encrypted_access_token) {
              const token = decryptToken(rawAccount.encrypted_access_token);
              if (token) {
                try {
                  if (t.platform === 'FACEBOOK_PAGE') {
                    const res = await MetaPublisherAdapter.deletePostFromFacebook(t.remote_post_id, token);
                    if (!res.success && res.error) deletionErrors.push(`Facebook: ${res.error}`);
                  } else if (t.platform === 'INSTAGRAM') {
                    const res = await MetaPublisherAdapter.deletePostFromInstagram(t.remote_post_id, token);
                    if (!res.success && res.error) deletionErrors.push(`Instagram: ${res.error}`);
                  } else if (t.platform === 'LINKEDIN_ORG') {
                    const res = await LinkedInPublisherAdapter.deletePostFromLinkedIn(t.remote_post_id, token);
                    if (!res.success && res.error) deletionErrors.push(`LinkedIn: ${res.error}`);
                  }
                } catch (err: any) {
                  deletionErrors.push(`${t.platform}: ${err.message}`);
                }
              }
            }
          }
        }
      }
    }

    // 2. Delete targets & master post from database (CASCADE handles targets & logs)
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      return { success: false, error: error.message };
    }

    try {
      revalidatePath('/social-publisher');
    } catch (revErr) {
      console.warn('revalidatePath non-critical warning:', revErr);
    }
    return { 
      success: true, 
      platformErrors: deletionErrors.length > 0 ? deletionErrors : undefined 
    };
  } catch (err: any) {
    console.error('Unhandled error in deleteSocialPost:', err);
    return { success: false, error: err?.message || 'Failed to delete post.' };
  }
}
