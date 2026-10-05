"use client";

import { useState, useEffect } from "react";
import { Key, Save, Moon, Activity, Plus, Trash2 } from "lucide-react";
import { getApiKeysAndUsage, updateApiKeys } from "./actions";

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    async function loadKeys() {
      const keys = await getApiKeysAndUsage();
      if (keys.length === 0) {
        setApiKeys([{ id: 1, currentKey: "", stats: { daily: 0 } }]);
      } else {
        setApiKeys(keys.map((k: any) => ({ ...k, currentKey: k.key })));
      }
    }
    loadKeys();
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleKeyChange = (id: number, value: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, currentKey: value } : k));
  };

  const handleAddKey = () => {
    const nextId = (apiKeys[apiKeys.length - 1]?.id || 0) + 1;
    setApiKeys([...apiKeys, { id: nextId, currentKey: "", stats: { daily: 0 } }]);
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
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
      
      <div className="bg-card p-6 rounded-xl border border-border space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            AI Provider API Keys (Auto-Rotating)
          </h2>
          <button 
            onClick={handleAddKey}
            className="text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Key
          </button>
        </div>

        <div className="space-y-6">
          {apiKeys.map((apiKey, index) => {
            const used = apiKey.stats?.daily || 0;
            const limit = 20; // gemini-3.8-flash free tier limit is 20/day
            const percentage = Math.min((used / limit) * 100, 100);

            return (
              <div key={apiKey.id} className="space-y-3 pb-6 border-b border-border last:border-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-secondary-foreground">
                    API Key {index + 1}
                  </label>
                  {apiKeys.length > 1 && (
                    <button 
                      onClick={() => handleRemoveKey(apiKey.id)}
                      className="text-destructive/70 hover:text-destructive transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
                <input 
                  type="password" 
                  value={apiKey.currentKey}
                  onChange={(e) => handleKeyChange(apiKey.id, e.target.value)}
                  placeholder="Enter your AI API Key..."
                  className="w-full border border-border rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                
                <div className="bg-secondary/20 p-3 rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm flex items-center gap-1">
                      <Activity className="w-4 h-4 text-primary" /> Daily Usage
                    </span>
                    <span className="text-xs font-medium">{used} / {limit} requests</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${percentage > 85 ? 'bg-destructive' : percentage > 50 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-border">
          <h2 className="text-lg font-medium text-foreground flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-primary" />
            Page Settings
          </h2>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
            <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="w-4 h-4 rounded border-border text-primary" />
            Enable Dark Mode
          </label>
        </div>
      </div>
    </div>
  );
}
