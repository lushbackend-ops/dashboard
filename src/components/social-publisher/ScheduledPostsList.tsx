"use client";

import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Globe, 
  Ban, 
  RefreshCw, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { SocialPost } from '@/services/social/types';
import { cancelScheduledPost, reschedulePost, deleteSocialPost } from '@/app/(dashboard)/social-publisher/actions';

interface ScheduledPostsListProps {
  posts: SocialPost[];
  onRefresh?: () => void;
}

export function ScheduledPostsList({ posts, onRefresh }: ScheduledPostsListProps) {
  const [filter, setFilter] = useState<string>('ALL');
  const [actionId, setActionId] = useState<string | null>(null);
  const [rescheduleModalPost, setRescheduleModalPost] = useState<SocialPost | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('18:30');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter list
  const upcomingPosts = posts.filter(p => {
    if (filter === 'ALL') return p.status === 'SCHEDULED' || p.status === 'PUBLISHING';
    return p.status === filter;
  });

  const handleCancel = async (postId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) return;
    setActionId(postId);
    setFeedback(null);
    try {
      const res = await cancelScheduledPost(postId);
      if (!res.success) {
        setFeedback(res.error || 'Failed to cancel post');
      } else {
        if (onRefresh) onRefresh();
      }
    } finally {
      setActionId(null);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleModalPost || !rescheduleDate || !rescheduleTime) return;
    setActionId(rescheduleModalPost.id);
    setFeedback(null);
    try {
      const combinedLocal = `${rescheduleDate}T${rescheduleTime}:00+05:30`;
      const utcDate = new Date(combinedLocal);
      const res = await reschedulePost(rescheduleModalPost.id, utcDate.toISOString());
      if (!res.success) {
        setFeedback(res.error || 'Failed to reschedule post');
      } else {
        setRescheduleModalPost(null);
        if (onRefresh) onRefresh();
      }
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          {['ALL', 'SCHEDULED', 'PUBLISHING'].map((f) => (
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
              {f === 'ALL' ? 'Upcoming & Active' : f}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onRefresh && onRefresh()}
          className="text-xs font-medium text-secondary-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-card shadow-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {upcomingPosts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/40 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/60 text-secondary-foreground flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Upcoming Posts Scheduled</h3>
          <p className="text-xs text-secondary-foreground max-w-sm mx-auto">
            You don't have any scheduled social broadcasts right now. Compose a new post in the Create Post tab to set an exact publication date.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingPosts.map((post) => {
            const dateObj = post.scheduled_at ? new Date(post.scheduled_at) : null;
            const formattedSchedule = dateObj
              ? dateObj.toLocaleString('en-IN', {
                  timeZone: post.display_timezone || 'Asia/Kolkata',
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
              : 'Unscheduled';

            return (
              <div
                key={post.id}
                className="bg-card border border-border/50 rounded-2xl p-5 shadow-xs hover:border-primary/30 transition-all flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                <div className="flex gap-4 items-start flex-1 min-w-0">
                  {/* Media Thumbnail */}
                  {post.media_items && post.media_items.length > 0 ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-secondary border border-border/40">
                      {post.media_items[0].mimeType.startsWith('video/') ? (
                        <div className="w-full h-full bg-black/70 flex items-center justify-center text-white text-[10px]">
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
                  ) : (
                    <div className="w-20 h-20 rounded-xl shrink-0 bg-secondary/50 border border-border/40 flex items-center justify-center text-secondary-foreground">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  {/* Post details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary border border-primary/20">
                        {post.status}
                      </span>
                      {post.targets?.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-secondary-foreground font-medium"
                        >
                          {t.platform}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-foreground pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {formattedSchedule}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {post.display_timezone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                  <button
                    type="button"
                    onClick={() => {
                      setRescheduleModalPost(post);
                      if (post.scheduled_at) {
                        const d = new Date(post.scheduled_at);
                        setRescheduleDate(d.toISOString().split('T')[0]);
                      }
                    }}
                    disabled={actionId === post.id}
                    className="px-3 py-1.5 rounded-xl border border-border/60 hover:border-primary/40 text-xs font-medium text-foreground bg-secondary/20 hover:bg-secondary/50 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reschedule
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCancel(post.id)}
                    disabled={actionId === post.id}
                    className="px-3 py-1.5 rounded-xl border border-destructive/20 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
                  >
                    {actionId === post.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Ban className="w-3.5 h-3.5" />
                    )}
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm('Permanently delete this scheduled post from database?')) return;
                      setActionId(post.id);
                      try {
                        await deleteSocialPost(post.id, false);
                        if (onRefresh) onRefresh();
                      } finally {
                        setActionId(null);
                      }
                    }}
                    disabled={actionId === post.id}
                    className="p-1.5 rounded-xl border border-border/50 text-secondary-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-semibold text-foreground">
              Reschedule Post
            </h3>

            <p className="text-xs text-secondary-foreground line-clamp-2">
              "{rescheduleModalPost.caption}"
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-secondary-foreground block mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-secondary/30 border border-border/60 text-foreground text-sm rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-secondary-foreground block mb-1">
                  New Time (Asia/Kolkata)
                </label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-secondary/30 border border-border/60 text-foreground text-sm rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalPost(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 shadow-xs"
              >
                Save New Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
