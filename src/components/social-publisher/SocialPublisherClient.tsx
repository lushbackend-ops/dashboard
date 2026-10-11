"use client";

import { useState } from 'react';
import { 
  PlusCircle, 
  CalendarClock, 
  History, 
  Users2, 
  Sliders, 
  Share2 
} from 'lucide-react';
import { SocialConnectedAccount, SocialPost } from '@/services/social/types';
import { CreatePostComposer } from '@/components/social-publisher/CreatePostComposer';
import { ScheduledPostsList } from '@/components/social-publisher/ScheduledPostsList';
import { PublishingHistoryList } from '@/components/social-publisher/PublishingHistoryList';
import { ConnectedAccountsView } from '@/components/social-publisher/ConnectedAccountsView';
import { PublisherSettingsView } from '@/components/social-publisher/PublisherSettingsView';
import { useRouter } from 'next/navigation';

interface SocialPublisherClientProps {
  initialAccounts: SocialConnectedAccount[];
  initialPosts: SocialPost[];
  initialTab?: string;
}

export function SocialPublisherClient({
  initialAccounts,
  initialPosts,
  initialTab = 'create'
}: SocialPublisherClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const tabs = [
    { id: 'create', label: 'Create Post', icon: PlusCircle },
    { 
      id: 'scheduled', 
      label: 'Scheduled Posts', 
      icon: CalendarClock,
      count: initialPosts.filter(p => p.status === 'SCHEDULED').length
    },
    { id: 'history', label: 'Publishing History', icon: History },
    { 
      id: 'accounts', 
      label: 'Connected Accounts', 
      icon: Users2,
      count: initialAccounts.filter(a => a.status === 'ACTIVE').length
    },
    { id: 'settings', label: 'Settings & Worker', icon: Sliders }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Social Media Publisher
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-secondary-foreground font-light pl-13">
            Multi-channel scheduling and publishing engine for Lush Trade Corp.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-secondary-foreground hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'create' && (
          <div className="bg-card/70 border border-border/50 rounded-3xl p-6 sm:p-8 shadow-xs">
            <CreatePostComposer
              connectedAccounts={initialAccounts}
              onPostSuccess={() => {
                router.refresh();
                setActiveTab('scheduled');
              }}
              onNavigateToAccounts={() => setActiveTab('accounts')}
            />
          </div>
        )}

        {activeTab === 'scheduled' && (
          <ScheduledPostsList
            posts={initialPosts}
            onRefresh={() => router.refresh()}
          />
        )}

        {activeTab === 'history' && (
          <PublishingHistoryList
            posts={initialPosts}
            onRefresh={() => router.refresh()}
          />
        )}

        {activeTab === 'accounts' && (
          <ConnectedAccountsView
            accounts={initialAccounts}
            onRefresh={() => router.refresh()}
          />
        )}

        {activeTab === 'settings' && (
          <PublisherSettingsView />
        )}
      </div>
    </div>
  );
}
