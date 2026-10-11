import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const url = new URL(request.url);
  const origin = url.origin;

  // Anti-CSRF state token
  const state = Buffer.from(JSON.stringify({
    platform,
    nonce: Math.random().toString(36).substring(2),
    timestamp: Date.now()
  })).toString('base64url');

  if (platform === 'meta') {
    const clientId = process.env.META_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'META_CLIENT_ID not configured in environment.' }, { status: 400 });
    }
    const redirectUri = `${origin}/api/social/oauth/meta/callback`;
    // Meta Graph API scopes for Page Management & Instagram publishing
    // Use spaces or commas depending on Meta API version
    const scopes = [
      'public_profile',
      'email',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts'
    ].join(',');

    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=${encodeURIComponent(scopes)}&response_type=code`;

    return NextResponse.redirect(authUrl);
  }

  if (platform === 'linkedin') {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID not configured in environment.' }, { status: 400 });
    }
    const redirectUri = `${origin}/api/social/oauth/linkedin/callback`;
    const scopes = ['w_organization_social', 'r_organization_social', 'rw_organization_admin'].join(' ');

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}&scope=${encodeURIComponent(scopes)}`;

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.json({ error: `Unknown platform ${platform}` }, { status: 400 });
}
