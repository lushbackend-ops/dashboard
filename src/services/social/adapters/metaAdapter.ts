import { SocialMediaItem, SocialPublishResult } from '../types';

/**
 * Meta Graph API Publishing Adapter
 * Handles publishing to Facebook Pages and Instagram Professional accounts.
 * Reference: Meta Graph API v21.0
 */
export class MetaPublisherAdapter {
  private static readonly GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

  /**
   * Publishes content to a Facebook Page.
   * Supports:
   * - Text-only posts
   * - Single Image posts
   * - Video posts
   * - Multi-photo posts (carousel)
   */
  public static async publishToFacebookPage(
    pageId: string,
    pageAccessToken: string,
    caption: string,
    mediaItems: SocialMediaItem[]
  ): Promise<SocialPublishResult> {
    try {
      if (!pageAccessToken || !pageId) {
        return {
          platform: 'FACEBOOK_PAGE',
          success: false,
          errorCode: 'AUTH_MISSING_CREDENTIALS',
          errorMessage: 'Facebook Page Access Token or Page ID is missing.'
        };
      }

      // Case 1: Video Post
      const video = mediaItems.find(m => m.mimeType.startsWith('video/'));
      if (video) {
        const videoRes = await fetch(`${this.GRAPH_API_BASE}/${pageId}/videos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: pageAccessToken,
            description: caption,
            file_url: video.url
          })
        });
        const videoData = await videoRes.json();
        if (!videoRes.ok || videoData.error) {
          return {
            platform: 'FACEBOOK_PAGE',
            success: false,
            errorCode: videoData.error?.code?.toString() || 'FB_VIDEO_ERROR',
            errorMessage: videoData.error?.message || 'Failed to upload video to Facebook Page'
          };
        }
        return {
          platform: 'FACEBOOK_PAGE',
          success: true,
          remotePostId: videoData.id
        };
      }

      // Case 2: Multi-image post (unpublished photos attached to feed)
      const images = mediaItems.filter(m => m.mimeType.startsWith('image/'));
      if (images.length > 1) {
        const attachedMedia: Array<{ media_fbid: string }> = [];
        for (const img of images) {
          const uploadPhotoRes = await fetch(`${this.GRAPH_API_BASE}/${pageId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: pageAccessToken,
              url: img.url,
              published: false
            })
          });
          const photoData = await uploadPhotoRes.json();
          if (uploadPhotoRes.ok && photoData.id) {
            attachedMedia.push({ media_fbid: photoData.id });
          } else {
            return {
              platform: 'FACEBOOK_PAGE',
              success: false,
              errorCode: photoData.error?.code?.toString() || 'FB_PHOTO_UPLOAD_FAILED',
              errorMessage: photoData.error?.message || 'Failed to prepare Facebook photo container.'
            };
          }
        }

        const feedRes = await fetch(`${this.GRAPH_API_BASE}/${pageId}/feed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: pageAccessToken,
            message: caption,
            attached_media: attachedMedia
          })
        });
        const feedData = await feedRes.json();
        if (!feedRes.ok || feedData.error) {
          return {
            platform: 'FACEBOOK_PAGE',
            success: false,
            errorCode: feedData.error?.code?.toString() || 'FB_FEED_ERROR',
            errorMessage: feedData.error?.message || 'Failed to publish multi-photo post.'
          };
        }
        return {
          platform: 'FACEBOOK_PAGE',
          success: true,
          remotePostId: feedData.id
        };
      }

      // Case 3: Single Image post
      if (images.length === 1) {
        const photoRes = await fetch(`${this.GRAPH_API_BASE}/${pageId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: pageAccessToken,
            url: images[0].url,
            caption: caption
          })
        });
        const photoData = await photoRes.json();
        if (!photoRes.ok || photoData.error) {
          return {
            platform: 'FACEBOOK_PAGE',
            success: false,
            errorCode: photoData.error?.code?.toString() || 'FB_PHOTO_ERROR',
            errorMessage: photoData.error?.message || 'Failed to publish photo to Facebook Page.'
          };
        }
        return {
          platform: 'FACEBOOK_PAGE',
          success: true,
          remotePostId: photoData.id || photoData.post_id
        };
      }

      // Case 4: Text-only status update
      const textRes = await fetch(`${this.GRAPH_API_BASE}/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: pageAccessToken,
          message: caption
        })
      });
      const textData = await textRes.json();
      if (!textRes.ok || textData.error) {
        return {
          platform: 'FACEBOOK_PAGE',
          success: false,
          errorCode: textData.error?.code?.toString() || 'FB_FEED_ERROR',
          errorMessage: textData.error?.message || 'Failed to publish status update.'
        };
      }

      return {
        platform: 'FACEBOOK_PAGE',
        success: true,
        remotePostId: textData.id
      };
    } catch (err: any) {
      return {
        platform: 'FACEBOOK_PAGE',
        success: false,
        errorCode: 'FB_ADAPTER_EXCEPTION',
        errorMessage: err.message || 'Unexpected network error during Facebook publishing'
      };
    }
  }

  /**
   * Publishes content to an Instagram Professional account via Instagram Graph API.
   * Follows the official 2-step container workflow:
   * 1. POST /{ig-user-id}/media to create media container
   * 2. Wait / Poll container status (for videos/reels)
   * 3. POST /{ig-user-id}/media_publish to publish container
   */
  public static async publishToInstagram(
    igUserId: string,
    accessToken: string,
    caption: string,
    mediaItems: SocialMediaItem[]
  ): Promise<SocialPublishResult> {
    try {
      if (!accessToken || !igUserId) {
        return {
          platform: 'INSTAGRAM',
          success: false,
          errorCode: 'AUTH_MISSING_CREDENTIALS',
          errorMessage: 'Instagram User ID or Access Token is missing.'
        };
      }

      if (!mediaItems || mediaItems.length === 0) {
        return {
          platform: 'INSTAGRAM',
          success: false,
          errorCode: 'IG_MEDIA_REQUIRED',
          errorMessage: 'Instagram requires at least one image or video for publishing.'
        };
      }

      const video = mediaItems.find(m => m.mimeType.startsWith('video/'));
      const images = mediaItems.filter(m => m.mimeType.startsWith('image/'));

      let creationId: string;

      if (video) {
        // Step 1: Create Video/Reels Container
        const containerRes = await fetch(`${this.GRAPH_API_BASE}/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            media_type: 'REELS',
            video_url: video.url,
            caption: caption
          })
        });
        const containerData = await containerRes.json();
        if (!containerRes.ok || containerData.error) {
          return {
            platform: 'INSTAGRAM',
            success: false,
            errorCode: containerData.error?.code?.toString() || 'IG_CONTAINER_ERROR',
            errorMessage: containerData.error?.message || 'Failed to create Instagram video container'
          };
        }
        creationId = containerData.id;

        // Step 2: Poll container status until FINISHED
        const isReady = await this.waitForInstagramContainerReady(creationId, accessToken);
        if (!isReady) {
          return {
            platform: 'INSTAGRAM',
            success: false,
            errorCode: 'IG_PROCESSING_TIMEOUT',
            errorMessage: 'Instagram video container processing timed out.',
            requiresAttention: true
          };
        }
      } else if (images.length > 1) {
        // Multi-image Carousel:
        // 1. Create sub-containers
        const itemIds: string[] = [];
        for (const img of images) {
          const itemRes = await fetch(`${this.GRAPH_API_BASE}/${igUserId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: accessToken,
              image_url: img.url,
              is_carousel_item: true
            })
          });
          const itemData = await itemRes.json();
          if (!itemRes.ok || itemData.error) {
            return {
              platform: 'INSTAGRAM',
              success: false,
              errorCode: itemData.error?.code?.toString() || 'IG_CAROUSEL_ITEM_ERROR',
              errorMessage: itemData.error?.message || 'Failed to create Instagram carousel item'
            };
          }
          itemIds.push(itemData.id);
        }

        // 2. Create parent carousel container
        const parentRes = await fetch(`${this.GRAPH_API_BASE}/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            media_type: 'CAROUSEL',
            children: itemIds,
            caption: caption
          })
        });
        const parentData = await parentRes.json();
        if (!parentRes.ok || parentData.error) {
          return {
            platform: 'INSTAGRAM',
            success: false,
            errorCode: parentData.error?.code?.toString() || 'IG_CAROUSEL_ERROR',
            errorMessage: parentData.error?.message || 'Failed to create Instagram carousel parent container'
          };
        }
        creationId = parentData.id;
      } else {
        // Single Image Container
        const containerRes = await fetch(`${this.GRAPH_API_BASE}/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            image_url: images[0].url,
            caption: caption
          })
        });
        const containerData = await containerRes.json();
        if (!containerRes.ok || containerData.error) {
          return {
            platform: 'INSTAGRAM',
            success: false,
            errorCode: containerData.error?.code?.toString() || 'IG_CONTAINER_ERROR',
            errorMessage: containerData.error?.message || 'Failed to create Instagram image container'
          };
        }
        creationId = containerData.id;
      }

      // Step 3: Publish the container
      const publishRes = await fetch(`${this.GRAPH_API_BASE}/${igUserId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: accessToken,
          creation_id: creationId
        })
      });
      const publishData = await publishRes.json();
      if (!publishRes.ok || publishData.error) {
        return {
          platform: 'INSTAGRAM',
          success: false,
          errorCode: publishData.error?.code?.toString() || 'IG_PUBLISH_ERROR',
          errorMessage: publishData.error?.message || 'Failed to publish Instagram container'
        };
      }

      return {
        platform: 'INSTAGRAM',
        success: true,
        remotePostId: publishData.id
      };
    } catch (err: any) {
      return {
        platform: 'INSTAGRAM',
        success: false,
        errorCode: 'IG_ADAPTER_EXCEPTION',
        errorMessage: err.message || 'Unexpected network error during Instagram publishing'
      };
    }
  }

  private static async waitForInstagramContainerReady(
    creationId: string, 
    accessToken: string,
    maxRetries = 10,
    delayMs = 3000
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const res = await fetch(`${this.GRAPH_API_BASE}/${creationId}?fields=status_code&access_token=${accessToken}`);
      const data = await res.json();
      if (data.status_code === 'FINISHED') {
        return true;
      }
      if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') {
        return false;
      }
      await new Promise(r => setTimeout(r, delayMs));
    }
    return false;
  }

  /**
   * Deletes a published post from Facebook Page.
   */
  public static async deletePostFromFacebook(
    remotePostId: string,
    pageAccessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!remotePostId || !pageAccessToken) {
        return { success: false, error: 'Missing remote post ID or page access token.' };
      }
      const res = await fetch(`${this.GRAPH_API_BASE}/${remotePostId}?access_token=${pageAccessToken}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, error: data.error?.message || 'Failed to delete Facebook post.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error deleting Facebook post.' };
    }
  }

  /**
   * Deletes a published media item from Instagram.
   */
  public static async deletePostFromInstagram(
    remotePostId: string,
    accessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!remotePostId || !accessToken) {
        return { success: false, error: 'Missing remote post ID or access token.' };
      }
      const res = await fetch(`${this.GRAPH_API_BASE}/${remotePostId}?access_token=${accessToken}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { success: false, error: data.error?.message || 'Failed to delete Instagram media.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error deleting Instagram media.' };
    }
  }
}

