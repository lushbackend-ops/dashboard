"use client";

import { useState } from "react";
import { Loader2, Wand2, Play, Download, Save, Settings, Layers, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Player } from "@remotion/player";
import { LeadGenerationReel } from "../../../../remotion/compositions/LeadGenerationReel";

export default function AIStudioPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setResult(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/ai-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Studio</h1>
          <p className="text-[14px] text-secondary-foreground mt-1">Create branded content for Lush Trade Corp.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ai-studio/library" className="bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary transition flex items-center gap-2">
            <Layers className="w-4 h-4" /> Library
          </Link>
          <Link href="/ai-studio/settings" className="bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary transition flex items-center gap-2">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Content Configuration</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1 block">Product</label>
                <select name="product" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="Cashews">Cashews</option>
                  <option value="Spices">Spices</option>
                  <option value="Rice">Rice</option>
                  <option value="Agricultural Products">Agricultural Products</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1 block">Target Market</label>
                <select name="targetMarket" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="UAE">UAE</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Qatar">Qatar</option>
                  <option value="USA">USA</option>
                  <option value="Europe">Europe</option>
                  <option value="Global">Global</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1 block">Content Format</label>
                <select name="contentType" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="instagram-reel">Instagram Reel</option>
                  <option value="facebook-reel">Facebook Reel (Coming Soon)</option>
                  <option value="youtube-short">YouTube Short (Coming Soon)</option>
                  <option value="linkedin-video">LinkedIn Video (Coming Soon)</option>
                  <option value="instagram-post">Instagram Post (Coming Soon)</option>
                  <option value="facebook-post">Facebook Post (Coming Soon)</option>
                  <option value="linkedin-post">LinkedIn Post (Coming Soon)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1 block">Campaign Goal</label>
                <select name="campaignGoal" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="lead-generation">Lead Generation</option>
                  <option value="product-promotion">Product Promotion</option>
                  <option value="brand-awareness">Brand Awareness</option>
                  <option value="educational">Educational</option>
                  <option value="company-announcement">Company Announcement</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1 block">Duration</label>
                <select name="duration" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="15">15 seconds</option>
                  <option value="10">10 seconds (Coming Soon)</option>
                  <option value="20">20 seconds (Coming Soon)</option>
                  <option value="30">30 seconds (Coming Soon)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1 block">Tone</label>
                <select name="tone" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="premium">Premium</option>
                  <option value="corporate">Corporate</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="minimal">Minimal</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-secondary-foreground mb-1 block">Call To Action (CTA)</label>
                <select name="cta" className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="Contact Us">Contact Us</option>
                  <option value="Request Quote">Request Quote</option>
                  <option value="Visit Website">Visit Website</option>
                  <option value="Become a Buyer">Become a Buyer</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-secondary-foreground mb-1 block">Additional Instructions</label>
              <textarea name="instructions" rows={3} placeholder="e.g., Create a premium B2B reel targeting Dubai importers." className="w-full border border-border rounded-md p-2 bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"></textarea>
            </div>

            <button type="submit" disabled={isGenerating} className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2">
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Content...</> : <><Wand2 className="w-5 h-5" /> Generate Content</>}
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-[24px] p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {!result && !isGenerating ? (
            <div className="text-center text-secondary-foreground">
              <ImageIcon className="w-12 h-12 opacity-50 mx-auto mb-4" />
              <p>Preview and generation status will appear here.</p>
            </div>
          ) : isGenerating ? (
            <div className="text-center text-primary">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
              <p>Analyzing market & generating premium content...</p>
            </div>
          ) : result?.error ? (
            <div className="text-center text-destructive p-6 bg-destructive/10 rounded-xl border border-destructive/20 max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Generation Failed</h3>
              <p className="text-sm">{result.error.includes("quota") || result.error.includes("429") ? "Google AI Quota Exceeded! Your API key has run out of free requests for today. Please check your billing or use a different key." : result.error}</p>
            </div>
          ) : result && (
            <div className="w-full h-full flex flex-col gap-4">
              <div className="flex-1 overflow-y-auto">
                <h3 className="font-semibold text-foreground mb-4">Generated Content Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-secondary-foreground font-medium">Headline:</span>
                    <span className="font-medium text-foreground">{result.headline}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-secondary-foreground font-medium">Subheadline:</span>
                    <span className="text-foreground">{result.subheadline}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-secondary-foreground font-medium">Hook:</span>
                    <span className="text-foreground">{result.hook}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-secondary-foreground font-medium">CTA:</span>
                    <span className="text-primary font-medium">{result.cta}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
                     <p className="font-semibold mb-2">Scenes Timeline:</p>
                     <div className="space-y-2">
                        {result.scenes?.map((scene: any, idx: number) => (
                           <div key={idx} className="bg-secondary/20 p-2 rounded border border-border/40 text-xs flex justify-between">
                             <span>[{scene.start}s - {scene.end}s] {scene.type}</span>
                             <span className="truncate max-w-[200px]" title={scene.text}>"{scene.text}"</span>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                 {result.showPreview ? (
                   <div className="flex flex-col gap-2">
                     <div className="w-full max-w-[300px] mx-auto overflow-hidden rounded-md border border-border shadow-lg">
                       <Player
                         component={LeadGenerationReel}
                         inputProps={result}
                         durationInFrames={result.duration * 30 || 450}
                         fps={30}
                         compositionWidth={1080}
                         compositionHeight={1920}
                         style={{ width: "100%", aspectRatio: "9/16" }}
                         controls
                         autoPlay
                       />
                     </div>
                     <div className="flex gap-2 mt-4">
                       <a href="/api/ai-studio/render" className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 flex justify-center items-center gap-2 text-center" onClick={(e) => { e.preventDefault(); alert("Local MP4 export requires @remotion/lambda. Please use preview!"); }}>
                          <Download className="w-4 h-4" /> Export MP4
                       </a>
                     </div>
                   </div>
                 ) : (
                   <button 
                     onClick={async () => {
                       setIsGenerating(true);
                         // Mock the API call rendering delay
                         await new Promise(resolve => setTimeout(resolve, 1000));
                         setResult({ ...result, showPreview: true });
                         setIsGenerating(false);
                     }}
                     className="bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 flex justify-center items-center gap-2"
                   >
                      <Play className="w-4 h-4" /> Render Video
                   </button>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
