"use client";

import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  RotateCcw, 
  FileText, 
  Filter, 
  HelpCircle,
  Trash2,
  Loader2
} from 'lucide-react';
import { SocialPost } from '@/services/social/types';
import { deleteSocialPost } from '@/app/(dashboard)/social-publisher/actions';
import { InstagramLogo, FacebookLogo, LinkedInLogo } from './SocialIcons';

interface PublishingHistoryListProps {
  posts: SocialPost[];
  onRefresh?: () => void;
}

export function PublishingHistoryList({ posts, onRefresh }: PublishingHistoryListProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter finished or failed posts
  const historyPosts = posts.filter(p => {
    if (filter === 'ALL') return p.status !== 'DRAFT';
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PUBLISHED', 'PARTIALLY_PUBLISHED', 'FAILED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary text-secondary-foreground hover:text-foreground'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs text-secondary-foreground">
          Showing {historyPosts.length} recorded broadcast attempts
        </span>
      </div>

      {historyPosts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/40 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/60 text-secondary-foreground flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Publishing History Yet</h3>
          <p className="text-xs text-secondary-foreground max-w-sm mx-auto">
            Past publication results, platform logs, and retry options will appear here once posts are published or processed by the worker.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyPosts.map((post) => {
            const hasPublished = post.status === 'PUBLISHED';
            const hasPartial = post.status === 'PARTIALLY_PUBLISHED';
            const hasFailed = post.status === 'FAILED';
            const hasCancelled = post.status === 'CANCELLED';

            return (
              <div
                key={post.id}
                className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                        hasPublished
                          ? 'bg-success/10 text-success border border-success/20'
                          : hasPartial
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : hasCancelled
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}
                    >
                      {hasPublished && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {hasPartial && <AlertTriangle className="w-3.5 h-3.5" />}
                      {hasFailed && <XCircle className="w-3.5 h-3.5" />}
                      {post.status.replace('_', ' ')}
                    </span>

                    <span className="text-xs text-secondary-foreground">
                      Created: {new Date(post.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {post.published_at && (
                      <span className="text-xs text-secondary-foreground">
                        Executed: {new Date(post.published_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </span>
                    )}

                    <button
                      type="button"
                      disabled={deletingId === post.id}
                      onClick={async () => {
                        const deleteRemote = confirm(
                          'Delete this post?\n\nClick OK to delete it from both the dashboard database AND remote social media (Facebook/Instagram/LinkedIn).\nClick Cancel to keep it.'
                        );
                        if (!deleteRemote) return;
                        setDeletingId(post.id);
                        try {
                          const res = await deleteSocialPost(post.id, true);
                          if (res.platformErrors && res.platformErrors.length > 0) {
                            alert(`Note: The post was deleted from the dashboard database, but social media returned:\n\n${res.platformErrors.join('\n')}`);
                          }
                          if (onRefresh) onRefresh();
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg border border-destructive/20 hover:bg-destructive/10 text-destructive text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Delete post from database and social platforms"
                    >
                      {deletingId === post.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Delete Post</span>
                    </button>
                  </div>
                </div>

                {/* Caption preview & Media */}
                <div className="flex gap-4 items-start">
                  {post.media_items && post.media_items.length > 0 && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-secondary border border-border/40">
                      {post.media_items[0].mimeType.startsWith('video/') ? (
                        <div className="w-full h-full bg-black/70 flex items-center justify-center text-white text-[9px]">
                          Video
                        </div>
                      ) : (
                        <img
                          src={post.media_items[0].url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <p className="text-sm text-foreground leading-relaxed flex-1 line-clamp-3">
                    {post.caption}
                  </p>
                </div>

                {/* Per-Platform Diagnostics Table */}
                <div className="bg-secondary/20 rounded-xl p-3 border border-border/40 space-y-2">
                  <h5 className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">
                    Channel Diagnostics & Delivery Status
                  </h5>

                  <div className="divide-y divide-border/30">
                    {post.targets && post.targets.length > 0 ? (
                      post.targets.map((t) => (
                        <div
                          key={t.id}
                          className="py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
                        >
                          <div className="flex items-center gap-2.5">
                            {t.platform === 'INSTAGRAM' && <InstagramLogo className="w-4 h-4 shrink-0 rounded-xs" />}
                            {t.platform === 'FACEBOOK_PAGE' && <FacebookLogo className="w-4 h-4 shrink-0" />}
                            {t.platform === 'LINKEDIN_ORG' && <LinkedInLogo className="w-4 h-4 shrink-0 rounded-xs" />}
                            <span className="font-semibold text-foreground">
                              {t.platform === 'FACEBOOK_PAGE' ? 'Facebook Page' : t.platform === 'INSTAGRAM' ? 'Instagram' : 'LinkedIn Org'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                t.status === 'SUCCESS'
                                  ? 'bg-success/15 text-success'
                                  : t.status === 'NEEDS_ATTENTION'
                                  ? 'bg-amber-500/15 text-amber-500'
                                  : t.status === 'PENDING'
                                  ? 'bg-secondary text-secondary-foreground'
                                  : 'bg-destructive/15 text-destructive'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>

                          <div className="text-secondary-foreground text-right truncate max-w-sm">
                            {t.status === 'SUCCESS' ? (
                              <span className="text-success font-medium flex items-center gap-1">
                                Remote Post ID: {t.remote_post_id || 'Delivered'}
                              </span>
                            ) : t.error_message ? (
                              <span className="text-destructive">
                                {t.error_code ? `[${t.error_code}] ` : ''}
                                {t.error_message}
                              </span>
                            ) : (
                              <span>Pending worker delivery</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-1">
                        No platform targets registered for this post.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
