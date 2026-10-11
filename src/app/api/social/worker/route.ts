import { NextRequest, NextResponse } from 'next/server';
import { runSocialSchedulerWorker } from '@/services/social/worker';

export const dynamic = 'force-dynamic';

/**
 * Worker Trigger Endpoint
 * Can be called by:
 * 1. Vercel Cron (configured in vercel.json)
 * 2. External trigger (e.g., GitHub Actions curl cron)
 * 3. Manual administrative trigger with Authorization Bearer
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.SOCIAL_SCHEDULER_SECRET;
    const cronSecret = process.env.CRON_SECRET;
    
    const host = req.headers.get('host') || '';
    const origin = req.headers.get('origin') || '';
    const referer = req.headers.get('referer') || '';
    const secFetchSite = req.headers.get('sec-fetch-site');

    const isSameOrigin = 
      secFetchSite === 'same-origin' || 
      (origin && host && origin.includes(host)) ||
      (referer && host && referer.includes(host)) ||
      host.startsWith('localhost') ||
      host.startsWith('127.0.0.1');

    const isVercelCron = 
      req.headers.get('user-agent')?.includes('vercel-cron') ||
      req.headers.get('x-vercel-cron') === '1' ||
      (cronSecret && authHeader === `Bearer ${cronSecret}`);

    const isAuthorized = 
      isSameOrigin || 
      isVercelCron || 
      !secret || 
      authHeader === `Bearer ${secret}`;

    // Security check
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized scheduler trigger.' }, { status: 401 });
    }

    const summary = await runSocialSchedulerWorker();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Worker execution failed', message: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Allow GET for Vercel Cron default invocation
  return POST(req);
}
