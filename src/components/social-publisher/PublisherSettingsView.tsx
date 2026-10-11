"use client";

import { useState } from 'react';
import { 
  Server, 
  Clock, 
  Terminal, 
  Check, 
  Copy, 
  AlertCircle, 
  Zap, 
  Loader2 
} from 'lucide-react';

export function PublisherSettingsView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [runningManual, setRunningManual] = useState(false);
  const [workerResult, setWorkerResult] = useState<any>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTriggerWorkerManually = async () => {
    setRunningManual(true);
    setWorkerResult(null);
    try {
      const res = await fetch('/api/social/worker', { method: 'POST' });
      const data = await res.json();
      setWorkerResult(data);
    } catch (err: any) {
      setWorkerResult({ error: err.message });
    } finally {
      setRunningManual(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Timezone Config */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground">
              Scheduling Timezone
            </h4>
            <p className="text-xs text-secondary-foreground">
              Timezone used for composing schedules and displaying timestamps across Lush Trade Corp.
            </p>
          </div>
        </div>

        <div className="bg-secondary/30 p-4 rounded-2xl border border-border/40 flex items-center justify-between text-sm">
          <div>
            <span className="font-semibold text-foreground">Asia/Kolkata</span>
            <span className="text-xs text-secondary-foreground ml-2">(IST, UTC +05:30)</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs bg-success/15 text-success font-semibold">
            Active Default
          </span>
        </div>
      </div>

      {/* Scheduler Worker Runner */}
      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground">
                Automated Scheduling Worker
              </h4>
              <p className="text-xs text-secondary-foreground">
                Claims and processes due scheduled posts concurrency-safely with Postgres row-level timestamps.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerWorkerManually}
            disabled={runningManual}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            {runningManual ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Trigger Worker Now
          </button>
        </div>

        {workerResult && (
          <div className="bg-secondary/40 p-4 rounded-2xl border border-border/40 text-xs font-mono space-y-1">
            <p className="text-secondary-foreground font-semibold">Worker Response:</p>
            <pre className="whitespace-pre-wrap text-foreground">
              {JSON.stringify(workerResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="border-t border-border/30 pt-4 space-y-3">
          <h5 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Worker Invocation URL & Cron Setup
          </h5>
          <p className="text-xs text-secondary-foreground leading-relaxed">
            Configure an automated caller (Vercel Cron, GitHub Actions, or AWS EventBridge) to trigger the worker every 5 minutes:
          </p>

          <div className="bg-secondary/50 rounded-xl p-3 font-mono text-xs flex items-center justify-between border border-border/40">
            <span className="truncate mr-2">POST /api/social/worker</span>
            <button
              onClick={() => handleCopy('endpoint', 'POST /api/social/worker')}
              className="text-secondary-foreground hover:text-foreground shrink-0"
              title="Copy endpoint"
            >
              {copiedKey === 'endpoint' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-secondary/50 rounded-xl p-3 font-mono text-xs flex items-center justify-between border border-border/40">
            <span className="truncate mr-2">Header: Authorization: Bearer SOCIAL_SCHEDULER_SECRET</span>
            <button
              onClick={() => handleCopy('secret', 'Authorization: Bearer SOCIAL_SCHEDULER_SECRET')}
              className="text-secondary-foreground hover:text-foreground shrink-0"
              title="Copy header"
            >
              {copiedKey === 'secret' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
