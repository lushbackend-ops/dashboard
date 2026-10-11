"use client";

import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Unlink, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Loader2 
} from 'lucide-react';
import { SocialConnectedAccount, SocialPlatformType } from '@/services/social/types';
import { disconnectAccount, connectAccountManually } from '@/app/(dashboard)/social-publisher/actions';
import { Key } from 'lucide-react';
import { InstagramLogo, FacebookLogo, LinkedInLogo } from './SocialIcons';

interface ConnectedAccountsViewProps {
  accounts: SocialConnectedAccount[];
  onRefresh?: () => void;
}

export function ConnectedAccountsView({ accounts, onRefresh }: ConnectedAccountsViewProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [manualModalPlatform, setManualModalPlatform] = useState<SocialPlatformType | null>(null);
  const [manualName, setManualName] = useState('Lush Trade Corp');
  const [manualId, setManualId] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSaving, setManualSaving] = useState(false);

  const getAccount = (platform: SocialPlatformType) => {
    return accounts.find(a => a.platform === platform && a.status === 'ACTIVE');
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect this social account?')) return;
    setLoadingId(id);
    try {
      await disconnectAccount(id);
      if (onRefresh) onRefresh();
    } finally {
      setLoadingId(null);
    }
  };

  const handleOAuthConnect = (platform: 'meta' | 'linkedin') => {
    window.location.href = `/api/social/oauth/${platform}/authorize`;
  };

  const handleSaveManual = async () => {
    if (!manualModalPlatform) return;
    setManualError(null);
    setManualSaving(true);
    try {
      const res = await connectAccountManually(
        manualModalPlatform,
        manualName,
        manualId,
        manualToken
      );
      if (!res.success) {
        setManualError(res.error || 'Failed to connect');
      } else {
        setManualModalPlatform(null);
        setManualToken('');
        setManualId('');
        if (onRefresh) onRefresh();
      }
    } finally {
      setManualSaving(false);
    }
  };

  const platformsConfig = [
    {
      id: 'INSTAGRAM' as SocialPlatformType,
      name: 'Instagram Professional',
      oauthPlatform: 'meta' as const,
      color: 'from-amber-500 via-rose-500 to-purple-600',
      description: 'Business or Creator account connected via your Facebook Page.',
      permissions: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement']
    },
    {
      id: 'FACEBOOK_PAGE' as SocialPlatformType,
      name: 'Facebook Business Page',
      oauthPlatform: 'meta' as const,
      color: 'bg-blue-600',
      description: 'Official Lush Trade Corp Facebook page for trade updates and posts.',
      permissions: ['pages_show_list', 'pages_manage_posts', 'pages_read_engagement']
    },
    {
      id: 'LINKEDIN_ORG' as SocialPlatformType,
      name: 'LinkedIn Organization Page',
      oauthPlatform: 'linkedin' as const,
      color: 'bg-[#0077b5]',
      description: 'B2B company page for import-export partnerships and leads.',
      permissions: ['w_organization_social', 'r_organization_social', 'rw_organization_admin']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-secondary/30 p-5 rounded-2xl border border-border/40">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Secure Official OAuth Platform Integrations
        </h4>
        <p className="text-xs text-secondary-foreground mt-1 leading-relaxed">
          Access tokens are encrypted at rest using AES-256-GCM and never exposed to the browser. Only the isolated server worker accesses them to publish approved trade updates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {platformsConfig.map((p) => {
          const account = getAccount(p.id);
          const isConnected = !!account;

          return (
            <div
              key={p.id}
              className={`bg-card border rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6 transition-all ${
                isConnected ? 'border-primary/30' : 'border-border/50'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  {p.id === 'INSTAGRAM' ? (
                    <InstagramLogo className="w-12 h-12 shadow-sm rounded-2xl overflow-hidden" />
                  ) : p.id === 'FACEBOOK_PAGE' ? (
                    <FacebookLogo className="w-12 h-12 shadow-sm" />
                  ) : (
                    <LinkedInLogo className="w-12 h-12 shadow-sm rounded-2xl overflow-hidden" />
                  )}

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                      isConnected
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        Disconnected
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-semibold text-foreground">
                    {p.name}
                  </h4>
                  <p className="text-xs text-secondary-foreground mt-1 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {isConnected && account && (
                  <div className="bg-secondary/40 p-3 rounded-xl space-y-1 text-xs">
                    <p className="font-semibold text-foreground truncate">
                      {account.account_name}
                    </p>
                    <p className="text-secondary-foreground text-[11px]">
                      Account ID: {account.account_id}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Connected: {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-secondary-foreground uppercase tracking-wider block">
                    Required Scopes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {p.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-[10px] bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {isConnected && account ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(account.id)}
                    disabled={loadingId === account.id}
                    className="w-full py-2.5 px-4 rounded-xl border border-destructive/20 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {loadingId === account.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Unlink className="w-3.5 h-3.5" />
                    )}
                    Disconnect Account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleOAuthConnect(p.oauthPlatform)}
                      className="w-full py-2.5 px-4 rounded-xl bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Connect via OAuth
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualModalPlatform(p.id);
                        setManualError(null);
                        setManualName(p.id === 'LINKEDIN_ORG' ? 'Lush Trade Corp' : 'Lush Trade Corp');
                      }}
                      className="w-full py-2 px-3 rounded-xl border border-border/70 hover:border-primary/40 text-[11px] font-medium text-secondary-foreground hover:text-foreground hover:bg-secondary/40 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-primary" />
                      Enter Page ID & Token Directly
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Token Entry Modal */}
      {manualModalPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Connect {manualModalPlatform.replace('_', ' ')}
              </h3>
              <p className="text-xs text-secondary-foreground mt-1">
                Directly register your official page/profile credentials. Tokens are encrypted at rest with AES-256-GCM.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-medium text-secondary-foreground block mb-1">
                  Account / Page Display Name
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Lush Trade Corp"
                  className="w-full bg-secondary/30 border border-border/60 text-foreground text-sm rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-secondary-foreground block mb-1">
                  Page ID / Organization ID / Username
                </label>
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder={manualModalPlatform === 'INSTAGRAM' ? 'e.g. lush_trade_corp' : 'e.g. 1029384756'}
                  className="w-full bg-secondary/30 border border-border/60 text-foreground text-sm rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-secondary-foreground block mb-1">
                  Permanent Access Token / API Key
                </label>
                <textarea
                  rows={3}
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste your page access token or permanent token..."
                  className="w-full bg-secondary/30 border border-border/60 text-foreground text-xs rounded-xl p-3 font-mono"
                />
              </div>

              {manualError && (
                <p className="text-xs text-destructive font-medium">{manualError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setManualModalPlatform(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground text-xs font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManual}
                disabled={manualSaving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {manualSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
