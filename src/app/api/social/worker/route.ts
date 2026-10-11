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
    const isSameOrigin = req.headers.get('sec-fetch-site') === 'same-origin' || req.headers.get('host')?.startsWith('localhost');

    // Security check: If secret is configured and not same-origin, require secret match
    if (secret && !isSameOrigin && authHeader !== `Bearer ${secret}`) {
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
  // Allow GET for Vercel Cron default invocation if authorized
  return POST(req);
}
