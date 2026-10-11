import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { encryptToken } from '@/services/social/crypto';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const origin = request.nextUrl.origin;

  if (error || !code) {
    return NextResponse.redirect(
      `${origin}/social-publisher?tab=accounts&error=${encodeURIComponent(
        errorDescription || error || 'OAuth authorization was cancelled or failed'
      )}`
    );
  }

  const supabase = await createClient();

  try {
    if (platform === 'meta') {
      const clientId = process.env.META_CLIENT_ID;
      const clientSecret = process.env.META_CLIENT_SECRET;
      const redirectUri = `${origin}/api/social/oauth/meta/callback`;

      if (!clientId || !clientSecret) {
        throw new Error('Meta Client credentials are not configured.');
      }

      // 1. Exchange code for Short-Lived User Access Token
      const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&code=${code}`;
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error?.message || 'Failed to exchange Meta authorization code.');
      }

      // 2. Exchange for Long-Lived Token (60-day expiry)
      const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`;
      const longLivedRes = await fetch(longLivedUrl);
      const longLivedData = await longLivedRes.json();
      const userAccessToken = longLivedData.access_token || tokenData.access_token;

      // 3. Fetch user's managed Facebook Pages and linked Instagram accounts
      const accountsRes = await fetch(
        `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${userAccessToken}`
      );
      const accountsData = await accountsRes.json();

      if (accountsData.data && accountsData.data.length > 0) {
        for (const page of accountsData.data) {
          // Save Facebook Page
          const encryptedPageToken = encryptToken(page.access_token);
          await supabase.from('social_connected_accounts').upsert(
            {
              platform: 'FACEBOOK_PAGE',
              account_name: page.name,
              account_id: page.id,
              encrypted_access_token: encryptedPageToken,
              status: 'ACTIVE',
              metadata: { page_id: page.id, page_name: page.name },
              updated_at: new Date().toISOString()
            },
            { onConflict: 'platform,account_id' }
          );

          // Save linked Instagram Professional account if present
          if (page.instagram_business_account) {
            const igAccount = page.instagram_business_account;
            // Instagram uses the Facebook Page's access token
            await supabase.from('social_connected_accounts').upsert(
              {
                platform: 'INSTAGRAM',
                account_name: igAccount.username || igAccount.name || `${page.name} (IG)`,
                account_id: igAccount.id,
                encrypted_access_token: encryptedPageToken,
                status: 'ACTIVE',
                metadata: {
                  ig_id: igAccount.id,
                  username: igAccount.username,
                  linked_page_id: page.id
                },
                updated_at: new Date().toISOString()
              },
              { onConflict: 'platform,account_id' }
            );
          }
        }
      }

      return NextResponse.redirect(`${origin}/social-publisher?tab=accounts&connected=meta`);
    }

    if (platform === 'linkedin') {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
      const redirectUri = `${origin}/api/social/oauth/linkedin/callback`;

      if (!clientId || !clientSecret) {
        throw new Error('LinkedIn credentials are not configured.');
      }

      // Exchange code for Access Token
      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret
        })
      });
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || 'Failed to exchange LinkedIn token.');
      }

      const accessToken = tokenData.access_token;
      const encryptedToken = encryptToken(accessToken);

      // Fetch user's managed organizations
      const orgAclsRes = await fetch(
        'https://api.linkedin.com/rest/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'LinkedIn-Version': '202410',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      );

      const orgAclsData = await orgAclsRes.json();
      let savedAny = false;

      if (orgAclsData.elements && orgAclsData.elements.length > 0) {
        for (const item of orgAclsData.elements) {
          const orgUrn = item.organizationalTarget; // e.g., "urn:li:organization:12345"
          const orgId = orgUrn.replace('urn:li:organization:', '');

          // Get organization display name
          let orgName = `Lush Trade Corp (${orgId})`;
          try {
            const orgDetailRes = await fetch(
              `https://api.linkedin.com/rest/organizations/${orgId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'LinkedIn-Version': '202410',
                  'X-Restli-Protocol-Version': '2.0.0'
                }
              }
            );
            if (orgDetailRes.ok) {
              const orgDetail = await orgDetailRes.json();
              orgName = orgDetail.localizedName || orgName;
            }
          } catch {}

          await supabase.from('social_connected_accounts').upsert(
            {
              platform: 'LINKEDIN_ORG',
              account_name: orgName,
              account_id: orgId,
              encrypted_access_token: encryptedToken,
              status: 'ACTIVE',
              metadata: { orgUrn },
              updated_at: new Date().toISOString()
            },
            { onConflict: 'platform,account_id' }
          );
          savedAny = true;
        }
      }

      if (!savedAny) {
        // Fallback: save using configured default org ID or generic entry
        const fallbackOrgId = process.env.LINKEDIN_DEFAULT_ORG_ID || 'lush-trade-corp';
        await supabase.from('social_connected_accounts').upsert(
          {
            platform: 'LINKEDIN_ORG',
            account_name: 'Lush Trade Corp (LinkedIn Organization)',
            account_id: fallbackOrgId,
            encrypted_access_token: encryptedToken,
            status: 'ACTIVE',
            updated_at: new Date().toISOString()
          },
          { onConflict: 'platform,account_id' }
        );
      }

      return NextResponse.redirect(`${origin}/social-publisher?tab=accounts&connected=linkedin`);
    }

    return NextResponse.redirect(`${origin}/social-publisher?tab=accounts&error=UnsupportedPlatform`);
  } catch (err: any) {
    return NextResponse.redirect(
      `${origin}/social-publisher?tab=accounts&error=${encodeURIComponent(err.message || 'OAuth error')}`
    );
  }
}
