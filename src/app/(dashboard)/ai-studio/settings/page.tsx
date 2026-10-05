"use client";

import { Save } from "lucide-react";
import Link from "next/link";

export default function AIStudioSettings() {
  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Brand Settings</h1>
          <p className="text-[14px] text-secondary-foreground mt-1">Configure default assets for AI Studio generation.</p>
        </div>
        <Link href="/ai-studio" className="bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary transition">
          Back to Studio
        </Link>
      </div>

      <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm">
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Saved locally!"); }}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1 block">Company Name</label>
              <input type="text" defaultValue="Lush Trade Corp" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1 block">Website</label>
              <input type="url" defaultValue="https://www.lushtradecorp.com" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1 block">Primary Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#38bdf8" className="w-10 h-10 rounded border border-border p-1 bg-transparent" />
                <input type="text" defaultValue="#38bdf8" className="flex-1 border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1 block">Secondary Color (Hex)</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#0f172a" className="w-10 h-10 rounded border border-border p-1 bg-transparent" />
                <input type="text" defaultValue="#0f172a" className="flex-1 border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-secondary-foreground mb-1 block">Default Hashtags</label>
            <input type="text" defaultValue="#B2B #Export #LushTradeCorp #GlobalTrade" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div className="pt-4 border-t border-border">
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Brand Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
