"use client";

import { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  CalendarClock, 
  Info, 
  Loader2,
  FileVideo,
  ImageIcon,
  Sparkles
} from 'lucide-react';
import { 
  SocialPlatformType, 
  SocialMediaItem, 
  SocialConnectedAccount, 
  PLATFORM_SPECS 
} from '@/services/social/types';
import { DateTimePicker } from './DateTimePicker';
import { createSocialPost } from '@/app/(dashboard)/social-publisher/actions';
import { createClient } from '@/utils/supabase/client';
import { InstagramLogo, FacebookLogo, LinkedInLogo } from './SocialIcons';

interface CreatePostComposerProps {
  connectedAccounts: SocialConnectedAccount[];
  onPostSuccess?: () => void;
  onNavigateToAccounts?: () => void;
}

export function CreatePostComposer({
  connectedAccounts,
  onPostSuccess,
  onNavigateToAccounts
}: CreatePostComposerProps) {
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformType[]>([]);
  const [mediaItems, setMediaItems] = useState<SocialMediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publishMode, setPublishMode] = useState<'NOW' | 'SCHEDULE'>('SCHEDULE');
  // Default to tomorrow 18:30 IST
  const [scheduledAtUtc, setScheduledAtUtc] = useState<string | null>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(tomorrow);
    const local = `${dateStr}T18:30:00+05:30`;
    return new Date(local).toISOString();
  });
  const [scheduledDisplay, setScheduledDisplay] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(tomorrow);
    const local = `${dateStr}T18:30:00+05:30`;
    return new Date(local).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; details?: any } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map connected platforms
  const connectedMap = new Map<SocialPlatformType, SocialConnectedAccount>();
  connectedAccounts.forEach(acc => {
    if (acc.status === 'ACTIVE') {
      connectedMap.set(acc.platform, acc);
    }
  });

  const togglePlatform = (platform: SocialPlatformType) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // Upload handler to Supabase storage with mock local fallback for UI testing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setFeedback(null);

    try {
      const newMediaList: SocialMediaItem[] = [...mediaItems];
      const supabase = createClient();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
          throw new Error(`File ${file.name} is not a supported image or video format.`);
        }

        // Platform constraints check
        for (const p of selectedPlatforms) {
          const spec = PLATFORM_SPECS[p];
          if (isVideo && spec.maxVideos === 0) {
            throw new Error(`${p} does not accept video files.`);
          }
          if (isVideo && file.size > spec.maxVideoSizeBytes) {
            throw new Error(`Video exceeds maximum size of ${(spec.maxVideoSizeBytes / (1024*1024)).toFixed(0)}MB for ${p}`);
          }
          if (isImage && file.size > spec.maxImageSizeBytes) {
            throw new Error(`Image exceeds maximum size of ${(spec.maxImageSizeBytes / (1024*1024)).toFixed(0)}MB for ${p}`);
          }
        }

        const ext = file.name.split('.').pop();
        const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const path = `uploads/${safeName}`;

        let publicUrl = '';

        // Attempt Supabase storage upload to 'social-media-assets'
        const { data, error } = await supabase.storage
          .from('social-media-assets')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('social-media-assets')
            .getPublicUrl(path);
          publicUrl = urlData.publicUrl;
        } else {
          // Local blob fallback for immediate visual preview/testing
          publicUrl = URL.createObjectURL(file);
        }

        newMediaList.push({
          id: crypto.randomUUID(),
          name: file.name,
          url: publicUrl,
          storagePath: path,
          mimeType: file.type,
          sizeBytes: file.size
        });
      }

      setMediaItems(newMediaList);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Media upload failed'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (id: string) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
  };

  const handleValidateAndSubmit = () => {
    setFeedback(null);

    if (selectedPlatforms.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one social media platform.' });
      return;
    }

    if (!caption.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a caption for your post.' });
      return;
    }

    // Platform-specific validations
    for (const p of selectedPlatforms) {
      const spec = PLATFORM_SPECS[p];
      if (caption.length > spec.maxCharacters) {
        setFeedback({
          type: 'error',
          message: `Caption exceeds ${spec.maxCharacters} characters limit for ${p} (Current: ${caption.length})`
        });
        return;
      }

      if (p === 'INSTAGRAM' && mediaItems.length === 0) {
        setFeedback({
          type: 'error',
          message: 'Instagram requires at least one image or video to publish.'
        });
        return;
      }
    }

    if (publishMode === 'SCHEDULE') {
      if (!scheduledAtUtc) {
        setFeedback({ type: 'error', message: 'Please specify the exact date and time to schedule this post.' });
        return;
      }
      if (new Date(scheduledAtUtc).getTime() <= Date.now()) {
        setFeedback({ type: 'error', message: 'The chosen scheduled time has already passed. Please select a future time.' });
        return;
      }
    }

    setShowConfirmModal(true);
  };

  const executePostCreation = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await createSocialPost({
        caption,
        mediaItems,
        platforms: selectedPlatforms,
        publishMode,
        scheduledAtUtc: publishMode === 'SCHEDULE' ? scheduledAtUtc : null,
        displayTimezone: 'Asia/Kolkata'
      });

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to submit post.' });
      } else {
        setFeedback({
          type: 'success',
          message: publishMode === 'NOW' 
            ? 'Post published immediately to connected platforms!' 
            : `Post successfully scheduled for ${scheduledDisplay || 'future publication'}.`,
          details: res
        });

        // Clear form
        setCaption('');
        setMediaItems([]);
        if (onPostSuccess) onPostSuccess();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Platform Selection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            1. Select Target Platforms
          </label>
          <span className="text-xs text-secondary-foreground">
            Lush Trade Corp Multi-Channel Broadcast
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Instagram */}
          {(() => {
            const isConnected = connectedMap.has('INSTAGRAM');
            const isSelected = selectedPlatforms.includes('INSTAGRAM');
            return (
              <div
                onClick={() => isConnected && togglePlatform('INSTAGRAM')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected && isConnected
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : isConnected
                    ? 'border-border/60 bg-card hover:border-primary/40'
                    : 'border-border/40 bg-secondary/20 opacity-80 cursor-default'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <InstagramLogo className="w-10 h-10 shrink-0 shadow-sm rounded-xl overflow-hidden" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Instagram</h4>
                      <p className="text-xs text-secondary-foreground">
                        {isConnected 
                          ? `@${connectedMap.get('INSTAGRAM')?.account_name}` 
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {isConnected ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 text-primary rounded-md accent-primary"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToAccounts) onNavigateToAccounts();
                      }}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Connect
                    </button>
                  )}
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Limit: 2,200 chars</span>
                  <span className="text-amber-500 font-medium">Requires Image/Video</span>
                </div>
              </div>
            );
          })()}

          {/* Facebook Page */}
          {(() => {
            const isConnected = connectedMap.has('FACEBOOK_PAGE');
            const isSelected = selectedPlatforms.includes('FACEBOOK_PAGE');
            return (
              <div
                onClick={() => isConnected && togglePlatform('FACEBOOK_PAGE')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected && isConnected
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : isConnected
                    ? 'border-border/60 bg-card hover:border-primary/40'
                    : 'border-border/40 bg-secondary/20 opacity-80 cursor-default'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FacebookLogo className="w-10 h-10 shrink-0 shadow-sm" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Facebook Page</h4>
                      <p className="text-xs text-secondary-foreground">
                        {isConnected 
                          ? connectedMap.get('FACEBOOK_PAGE')?.account_name 
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {isConnected ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 text-primary rounded-md accent-primary"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToAccounts) onNavigateToAccounts();
                      }}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Connect
                    </button>
                  )}
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Limit: 63,206 chars</span>
                  <span className="text-success font-medium">Text, Photo & Video</span>
                </div>
              </div>
            );
          })()}

          {/* LinkedIn Organization */}
          {(() => {
            const isConnected = connectedMap.has('LINKEDIN_ORG');
            const isSelected = selectedPlatforms.includes('LINKEDIN_ORG');
            return (
              <div
                onClick={() => isConnected && togglePlatform('LINKEDIN_ORG')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected && isConnected
                    ? 'border-primary bg-primary/5 shadow-xs'
                    : isConnected
                    ? 'border-border/60 bg-card hover:border-primary/40'
                    : 'border-border/40 bg-secondary/20 opacity-80 cursor-default'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <LinkedInLogo className="w-10 h-10 shrink-0 shadow-sm rounded-xl overflow-hidden" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">LinkedIn Org</h4>
                      <p className="text-xs text-secondary-foreground truncate max-w-[140px]">
                        {isConnected 
                          ? connectedMap.get('LINKEDIN_ORG')?.account_name 
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {isConnected ? (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-4 h-4 text-primary rounded-md accent-primary"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateToAccounts) onNavigateToAccounts();
                      }}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Connect
                    </button>
                  )}
                </div>
                <div className="mt-3 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>Limit: 3,000 chars</span>
                  <span className="text-primary font-medium">B2B Company Feed</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Caption Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            2. Post Caption / Copy
          </label>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-secondary-foreground">
              Characters: <span className="font-semibold text-foreground">{caption.length}</span>
            </span>
            {selectedPlatforms.map(p => (
              <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {p}: max {PLATFORM_SPECS[p].maxCharacters}
              </span>
            ))}
          </div>
        </div>

        <textarea
          rows={5}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your trade update, shipment announcement, or product showcase for Lush Trade Corp..."
          className="w-full bg-card border border-border/50 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm leading-relaxed"
        ></textarea>
      </div>

      {/* Media Upload Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" />
            3. Media Assets (Images & Videos)
          </label>
          <span className="text-xs text-secondary-foreground">
            JPG, PNG, WebP, MP4 accepted
          </span>
        </div>

        {/* Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/70 hover:border-primary/50 bg-secondary/15 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/png,image/jpeg,image/webp,video/mp4"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {uploading ? 'Processing & Validating Media...' : 'Click or drag files here to upload'}
            </p>
            <p className="text-xs text-secondary-foreground mt-0.5">
              Images up to 10MB • Videos up to 100MB
            </p>
          </div>
        </div>

        {/* Media Preview Grid */}
        {mediaItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {mediaItems.map((item) => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-border/60 bg-card">
                {item.mimeType.startsWith('video/') ? (
                  <div className="h-28 w-full bg-black/80 flex flex-col items-center justify-center p-2 text-white">
                    <FileVideo className="w-8 h-8 text-primary mb-1" />
                    <span className="text-[10px] truncate max-w-full">{item.name}</span>
                  </div>
                ) : (
                  <div className="h-28 w-full overflow-hidden bg-secondary">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-2 text-[10px] text-secondary-foreground bg-card flex items-center justify-between border-t border-border/40">
                  <span className="truncate max-w-[90px]">{item.name}</span>
                  <span>{(item.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMedia(item.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date & Time Picker */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-border/40 pb-3">
          <label className="text-sm font-semibold text-foreground">
            4. Publication Mode:
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPublishMode('SCHEDULE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                publishMode === 'SCHEDULE'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary text-secondary-foreground hover:text-foreground'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Schedule for Later
            </button>
            <button
              type="button"
              onClick={() => setPublishMode('NOW')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                publishMode === 'NOW'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-secondary text-secondary-foreground hover:text-foreground'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Publish Immediately
            </button>
          </div>
        </div>

        {publishMode === 'SCHEDULE' && (
          <DateTimePicker
            value={scheduledAtUtc || ''}
            onChange={(utcIso, display) => {
              setScheduledAtUtc(utcIso);
              setScheduledDisplay(display);
            }}
            timezone="Asia/Kolkata"
          />
        )}
      </div>

      {/* Feedback Messages */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm flex items-start gap-3 border ${
            feedback.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{feedback.message}</p>
            {feedback.details?.results && (
              <div className="mt-2 space-y-1 text-xs">
                {feedback.details.results.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-medium">{r.platform}:</span>
                    <span>{r.success ? 'Published Successfully' : `Failed (${r.errorMessage || r.errorCode})`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleValidateAndSubmit}
          disabled={submitting || uploading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99] transition-all px-6 py-4 rounded-2xl font-medium text-base shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : publishMode === 'SCHEDULE' ? (
            <>
              <CalendarClock className="w-5 h-5" />
              <span>Confirm & Schedule Post</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Publish Now to Selected Platforms</span>
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-semibold text-foreground">
              Confirm Publication
            </h3>

            <div className="space-y-3 text-sm text-secondary-foreground">
              <div className="bg-secondary/40 p-3.5 rounded-xl space-y-2">
                <p><strong className="text-foreground">Target Channels:</strong> {selectedPlatforms.join(', ')}</p>
                <p><strong className="text-foreground">Media Attachments:</strong> {mediaItems.length} file(s)</p>
                <p>
                  <strong className="text-foreground">Execution:</strong>{' '}
                  {publishMode === 'NOW' ? 'Publish Immediately' : `Scheduled for ${scheduledDisplay} (Asia/Kolkata)`}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Please verify caption and compliance with trade publishing guidelines for Lush Trade Corp before proceeding.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                Back / Edit
              </button>
              <button
                type="button"
                onClick={executePostCreation}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
