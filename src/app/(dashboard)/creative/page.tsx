"use client";

import { useState } from "react";
import { generateCreative } from "./actions";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";

interface HistoryItem {
  id: string;
  concept: string;
  type: string;
  result: string;
  date: Date;
}

export default function CreativeStudio() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const concept = formData.get("concept") as string;
    const type = formData.get("type") as string;

    try {
      const response = await generateCreative(null, formData);
      if (response.success && response.result) {
        setHistory(prev => [{
          id: crypto.randomUUID(),
          concept,
          type,
          result: response.result,
          date: new Date()
        }, ...prev]);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(response.error || "Failed to generate");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 space-y-12 pb-24">
      {/* Header */}
      <div className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
          Creative Studio
        </h1>
        <p className="text-lg text-secondary-foreground max-w-xl mx-auto font-light">
          Generate premium captions and visual prompts tailored for Lush Trade Corp.
        </p>
      </div>
      
      {/* Generator Form */}
      <div className="bg-card/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 rounded-[32px] p-8 md:p-10 transition-all">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">
              Concept / Product
            </label>
            <input 
              name="concept" 
              required 
              className="w-full text-lg border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:bg-secondary/50 transition-all placeholder:text-muted-foreground/50" 
              placeholder="e.g. Bulk Cashew Nuts arriving in Dubai" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">
              Platform
            </label>
            <select 
              name="type" 
              className="w-full text-lg border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:bg-secondary/50 transition-all cursor-pointer appearance-none"
            >
              <option value="Instagram Reel">Instagram Reel</option>
              <option value="Facebook Post">Facebook Post</option>
              <option value="LinkedIn Post">LinkedIn Post</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-secondary-foreground uppercase tracking-wider pl-1">
              Context & Tone
            </label>
            <textarea 
              name="additionalInfo" 
              rows={3} 
              className="w-full text-lg border-0 bg-secondary/30 rounded-2xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:bg-secondary/50 transition-all resize-none placeholder:text-muted-foreground/50" 
              placeholder="e.g. Keep it strictly professional, mention our B2B pricing..."
            ></textarea>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isPending} 
              className="w-full bg-foreground text-background hover:scale-[1.01] hover:bg-foreground/90 active:scale-[0.98] transition-all px-8 py-5 rounded-2xl font-medium text-lg disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 shadow-lg"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isPending ? "Generating..." : "Generate Magic"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-center p-6 rounded-3xl border border-destructive/20 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-semibold mb-1">Generation Failed</h3>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      )}

      {/* History Feed */}
      {history.length > 0 && (
        <div className="space-y-8 pt-8">
          <h2 className="text-2xl font-semibold tracking-tight px-2">Recent Generations</h2>
          <div className="space-y-6">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="bg-card shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-border/40 rounded-[28px] p-8 md:p-10 animate-in fade-in slide-in-from-bottom-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium mb-3">
                      {item.type}
                    </div>
                    <h3 className="text-xl font-medium text-foreground leading-tight">
                      {item.concept}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(item.id, item.result)}
                    className="p-3 text-secondary-foreground hover:bg-secondary rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Copy to clipboard"
                  >
                    {copiedId === item.id ? <Check className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="bg-secondary/20 rounded-2xl p-6 text-base leading-relaxed text-foreground/90 whitespace-pre-wrap font-light border border-border/20">
                  {item.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
