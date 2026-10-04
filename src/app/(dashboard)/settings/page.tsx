"use client";

import { useState, useEffect } from "react";
import { Key, Activity, RefreshCw, Save, Plus, Trash2 } from "lucide-react";
import { getApiKeysAndUsage, updateApiKeys } from "./actions";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    async function loadKeys() {
      const keys = await getApiKeysAndUsage();
      setApiKeys(keys.map((k: any) => ({ ...k, currentKey: k.key })));
    }
    loadKeys();
  }, []);

  const handleKeyChange = (id: number, value: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, currentKey: value } : k));
  };

  const handleAddKey = () => {
    const nextId = (apiKeys[apiKeys.length - 1]?.id || 0) + 1;
    setApiKeys([...apiKeys, { id: nextId, key: "", currentKey: "", limit: 1500 }]);
  };

  const handleRemoveKey = (id: number) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const validKeys = apiKeys.map(k => k.currentKey).filter(k => k.trim() !== "");
    await updateApiKeys(validKeys);
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-70 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      
      <div className="bg-card p-6 rounded-xl border border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              AI Provider API Keys
            </h2>
            <select 
              value={timeframe}
              onChange={(e: any) => setTimeframe(e.target.value)}
              className="text-sm bg-background border border-border text-foreground rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="daily">Daily Limit</option>
              <option value="weekly">Weekly Limit</option>
              <option value="monthly">Monthly Limit</option>
            </select>
          </div>
          <button 
            onClick={handleAddKey}
            className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Key
          </button>
        </div>
        
        <div className="space-y-8">
          {apiKeys.map((apiKey, index) => {
            const used = apiKey.stats ? apiKey.stats[timeframe] : 0;
            const limit = timeframe === 'daily' ? 1500 : timeframe === 'weekly' ? 10500 : 45000;
            const percentage = Math.min((used / limit) * 100, 100);
            
            return (
              <div key={apiKey.id} className="space-y-4 pb-6 border-b border-border last:border-0 last:pb-0">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-secondary-foreground">
                      API Key {index + 1}
                    </label>
                    <button 
                      onClick={() => handleRemoveKey(apiKey.id)}
                      className="text-destructive/70 hover:text-destructive transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                  <input 
                    type="password" 
                    value={apiKey.currentKey}
                    onChange={(e) => handleKeyChange(apiKey.id, e.target.value)}
                    placeholder="Enter your AI API Key..."
                    className="w-full border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="bg-background p-4 rounded-lg border border-border relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <RefreshCw className="w-12 h-12 animate-[spin_4s_linear_infinite]" />
                  </div>
                  
                  <div className="flex justify-between items-center mb-2 relative z-10">
                    <h3 className="font-medium text-sm flex items-center gap-2 capitalize">
                      <Activity className="w-4 h-4 text-primary" />
                      Real-Time {timeframe} Usage
                    </h3>
                    <span className="text-sm font-medium text-secondary-foreground animate-pulse">
                      {used.toLocaleString()} / {limit.toLocaleString()} requests
                    </span>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden relative z-10 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${percentage > 85 ? 'bg-destructive' : percentage > 50 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="w-full h-full opacity-30 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-secondary-foreground mt-2 relative z-10 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    {percentage.toFixed(1)}% of limit consumed. Live syncing...
                  </p>
                </div>
              </div>
            );
          })}
          
          {apiKeys.length === 0 && (
            <p className="text-sm text-secondary-foreground">No API keys found in environment variables.</p>
          )}
        </div>
      </div>
    </div>
  );
}
