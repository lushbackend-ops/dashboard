export type SocialPlatformType = 'INSTAGRAM' | 'FACEBOOK_PAGE' | 'LINKEDIN_ORG';

export type SocialPostStatus = 
  | 'DRAFT' 
  | 'SCHEDULED' 
  | 'PUBLISHING' 
  | 'PUBLISHED' 
  | 'PARTIALLY_PUBLISHED' 
  | 'FAILED' 
  | 'CANCELLED';

export type SocialAttemptStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'NEEDS_ATTENTION';

export interface SocialMediaItem {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}

export interface SocialConnectedAccount {
  id: string;
  org_id?: string;
  platform: SocialPlatformType;
  account_name: string;
  account_id: string;
  status: string;
  scopes?: string[];
  token_expires_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SocialPostTarget {
  id: string;
  post_id: string;
  account_id?: string | null;
  platform: SocialPlatformType;
  status: SocialAttemptStatus;
  remote_post_id?: string | null;
  attempt_count: number;
  last_attempt_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  account?: SocialConnectedAccount;
}

export interface SocialPost {
  id: string;
  org_id?: string;
  created_by?: string;
  caption: string;
  media_items: SocialMediaItem[];
  display_timezone: string;
  scheduled_at: string | null;
  status: SocialPostStatus;
  claim_worker_id?: string | null;
  claim_expires_at?: string | null;
  published_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  targets?: SocialPostTarget[];
}

export interface SocialPublishResult {
  platform: SocialPlatformType;
  success: boolean;
  remotePostId?: string;
  errorCode?: string;
  errorMessage?: string;
  requiresAttention?: boolean;
}

export interface PlatformRestrictions {
  maxCharacters: number;
  allowedMediaTypes: string[];
  maxImages: number;
  maxVideos: number;
  maxVideoSizeBytes: number;
  maxImageSizeBytes: number;
  supportsCarousel: boolean;
  notes: string;
}

export const PLATFORM_SPECS: Record<SocialPlatformType, PlatformRestrictions> = {
  INSTAGRAM: {
    maxCharacters: 2200,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    maxImages: 10,
    maxVideos: 1,
    maxImageSizeBytes: 8 * 1024 * 1024, // 8MB
    maxVideoSizeBytes: 100 * 1024 * 1024, // 100MB
    supportsCarousel: true,
    notes: 'Requires Instagram Professional (Business or Creator) account linked to a Facebook Page.'
  },
  FACEBOOK_PAGE: {
    maxCharacters: 63206,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime'],
    maxImages: 10,
    maxVideos: 1,
    maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
    maxVideoSizeBytes: 500 * 1024 * 1024, // 500MB
    supportsCarousel: true,
    notes: 'Publishes to your managed business Facebook Page via Page Access Token.'
  },
  LINKEDIN_ORG: {
    maxCharacters: 3000,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxImages: 9,
    maxVideos: 1,
    maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
    maxVideoSizeBytes: 200 * 1024 * 1024, // 200MB
    supportsCarousel: false,
    notes: 'Publishes to LinkedIn Organization Page. Requires organization administrator permissions (w_organization_social).'
  }
};
