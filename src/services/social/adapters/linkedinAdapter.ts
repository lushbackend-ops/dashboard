import { SocialMediaItem, SocialPublishResult } from '../types';

/**
 * LinkedIn Community Management API Adapter
 * Publishes posts on behalf of an Organization Page.
 * Reference: LinkedIn REST API v2 / Restli / Version 202410
 */
export class LinkedInPublisherAdapter {
  private static readonly API_BASE = 'https://api.linkedin.com/rest';

  /**
   * Publishes content to a LinkedIn Organization Page.
   * Format: author: "urn:li:organization:{orgId}"
   */
  public static async publishToOrganizationPage(
    orgUrn: string, // e.g. "urn:li:organization:1234567" or "1234567"
    accessToken: string,
    caption: string,
    mediaItems: SocialMediaItem[]
  ): Promise<SocialPublishResult> {
    try {
      if (!accessToken || !orgUrn) {
        return {
          platform: 'LINKEDIN_ORG',
          success: false,
          errorCode: 'AUTH_MISSING_CREDENTIALS',
          errorMessage: 'LinkedIn Access Token or Organization ID is missing.'
        };
      }

      const formattedAuthor = orgUrn.startsWith('urn:li:organization:') 
        ? orgUrn 
        : `urn:li:organization:${orgUrn}`;

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'LinkedIn-Version': '202410',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      };

      // Case 1: Post with Media (Image)
      const images = mediaItems.filter(m => m.mimeType.startsWith('image/'));
      if (images.length > 0) {
        // Step 1: Initialize image upload
        const initRes = await fetch(`${this.API_BASE}/images?action=initializeUpload`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            initializeUploadRequest: {
              owner: formattedAuthor
            }
          })
        });
        const initData = await initRes.json();
        if (!initRes.ok || !initData.value?.uploadUrl) {
          return {
            platform: 'LINKEDIN_ORG',
            success: false,
            errorCode: 'LINKEDIN_INIT_UPLOAD_FAILED',
            errorMessage: initData.message || 'Failed to initialize image upload on LinkedIn.'
          };
        }

        const uploadUrl = initData.value.uploadUrl;
        const imageUrn = initData.value.image;

        // Step 2: Fetch image binary and PUT to uploadUrl
        const imgFetchRes = await fetch(images[0].url);
        if (!imgFetchRes.ok) {
          return {
            platform: 'LINKEDIN_ORG',
            success: false,
            errorCode: 'MEDIA_FETCH_FAILED',
            errorMessage: 'Unable to fetch uploaded media from storage for LinkedIn transfer.'
          };
        }
        const imgBuffer = await imgFetchRes.arrayBuffer();

        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': images[0].mimeType
          },
          body: imgBuffer
        });

        if (!putRes.ok) {
          return {
            platform: 'LINKEDIN_ORG',
            success: false,
            errorCode: 'LINKEDIN_BINARY_UPLOAD_FAILED',
            errorMessage: 'Failed to upload image binary to LinkedIn storage.'
          };
        }

        // Step 3: Create post with uploaded image
        const postRes = await fetch(`${this.API_BASE}/posts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            author: formattedAuthor,
            commentary: caption,
            visibility: 'PUBLIC',
            distribution: {
              feedDistribution: 'MAIN_FEED',
              targetEntities: [],
              thirdPartyDistributionChannels: []
            },
            content: {
              media: {
                title: images[0].name || 'Media',
                id: imageUrn
              }
            },
            lifecycleState: 'PUBLISHED'
          })
        });

        if (!postRes.ok) {
          const errData = await postRes.json().catch(() => ({}));
          return {
            platform: 'LINKEDIN_ORG',
            success: false,
            errorCode: postRes.status.toString(),
            errorMessage: errData.message || 'Failed to create LinkedIn organization image post.'
          };
        }

        const postUrn = postRes.headers.get('x-restli-id') || 'PUBLISHED';
        return {
          platform: 'LINKEDIN_ORG',
          success: true,
          remotePostId: postUrn
        };
      }

      // Case 2: Text commentary post
      const postRes = await fetch(`${this.API_BASE}/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          author: formattedAuthor,
          commentary: caption,
          visibility: 'PUBLIC',
          distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: []
          },
          lifecycleState: 'PUBLISHED'
        })
      });

      if (!postRes.ok) {
        const errData = await postRes.json().catch(() => ({}));
        return {
          platform: 'LINKEDIN_ORG',
          success: false,
          errorCode: postRes.status.toString(),
          errorMessage: errData.message || 'Failed to create LinkedIn organization text post.'
        };
      }

      const postUrn = postRes.headers.get('x-restli-id') || 'PUBLISHED';
      return {
        platform: 'LINKEDIN_ORG',
        success: true,
        remotePostId: postUrn
      };
    } catch (err: any) {
      return {
        platform: 'LINKEDIN_ORG',
        success: false,
        errorCode: 'LINKEDIN_ADAPTER_EXCEPTION',
        errorMessage: err.message || 'Unexpected network error during LinkedIn publishing'
      };
    }
  }

  /**
   * Deletes a published post from LinkedIn Organization.
   */
  public static async deletePostFromLinkedIn(
    remotePostUrn: string,
    accessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!remotePostUrn || !accessToken) {
        return { success: false, error: 'Missing post URN or LinkedIn access token.' };
      }
      const encodedUrn = encodeURIComponent(remotePostUrn);
      const res = await fetch(`${this.API_BASE}/posts/${encodedUrn}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'LinkedIn-Version': '202410',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.message || `LinkedIn returned status ${res.status}` };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error deleting LinkedIn post.' };
    }
  }
}
