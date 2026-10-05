"use client";

import { useState } from "react";
import { Building2, Package, Globe2, Save, FileText, Target, CheckCircle2 } from "lucide-react";

export default function AIBrainPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Mocking the AI Brain state that would normally be fetched from the DB
  const [brainData, setBrainData] = useState({
    companyName: "Lush Trade Corp",
    website: "https://www.lushtradecorp.com",
    industry: "B2B Commodities Trading & Export",
    mission: "To provide reliable, high-quality agricultural commodities (specializing in Cashew Nuts) to global markets with seamless export logistics.",
    targetMarkets: "United Arab Emirates (UAE), Middle East, Europe, Asia",
    keyProducts: "Raw Cashew Nuts, Processed Premium Cashews, Bulk Spices",
    valueProposition: "Export-ready supply, strict quality control, and transparent global logistics.",
    toneOfVoice: "Premium, professional, trustworthy, corporate.",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate DB save
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 pb-24 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <span className="font-medium">Brain updated successfully</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2 pt-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          AI Business Brain
        </h1>
        <p className="text-lg text-secondary-foreground font-light max-w-2xl">
          This is the core knowledge base. The AI uses these verified details to generate content, analyze leads, and build campaigns.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 rounded-[32px] p-8 space-y-6">
            <h2 className="text-xl font-medium flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-secondary-foreground" />
              Company Identity
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">Company Name</label>
                <input 
                  value={brainData.companyName}
                  onChange={e => setBrainData({...brainData, companyName: e.target.value})}
                  className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">Website URL</label>
                <input 
                  value={brainData.website}
                  onChange={e => setBrainData({...brainData, website: e.target.value})}
                  className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">Industry & Niche</label>
              <input 
                value={brainData.industry}
                onChange={e => setBrainData({...brainData, industry: e.target.value})}
                className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">Mission & Vision</label>
              <textarea 
                value={brainData.mission}
                onChange={e => setBrainData({...brainData, mission: e.target.value})}
                rows={3}
                className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">Core Value Proposition</label>
              <textarea 
                value={brainData.valueProposition}
                onChange={e => setBrainData({...brainData, valueProposition: e.target.value})}
                rows={2}
                className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-card/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 rounded-[32px] p-8 space-y-6">
            <h2 className="text-xl font-medium flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-secondary-foreground" />
              Market Focus
            </h2>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                <Globe2 className="w-4 h-4" /> Target Markets
              </label>
              <textarea 
                value={brainData.targetMarkets}
                onChange={e => setBrainData({...brainData, targetMarkets: e.target.value})}
                rows={3}
                className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                <Package className="w-4 h-4" /> Key Products
              </label>
              <textarea 
                value={brainData.keyProducts}
                onChange={e => setBrainData({...brainData, keyProducts: e.target.value})}
                rows={3}
                className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">
                Brand Tone of Voice
              </label>
              <input 
                value={brainData.toneOfVoice}
                onChange={e => setBrainData({...brainData, toneOfVoice: e.target.value})}
                className="w-full text-base border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] transition-all px-8 py-5 rounded-[24px] font-medium text-lg disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
          >
            {isSaving ? (
              "Updating Brain..."
            ) : (
              <>
                <Save className="w-5 h-5" /> Save to Knowledge Base
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
