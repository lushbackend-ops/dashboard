import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from "remotion";
import { z } from "zod";

export const leadGenerationReelSchema = z.object({
  product: z.string(),
  targetMarket: z.string(),
  hook: z.string(),
  headline: z.string(),
  subheadline: z.string(),
  cta: z.string(),
  website: z.string(),
  scenes: z.array(z.object({
    start: z.number(),
    end: z.number(),
    type: z.enum(["hook", "product", "benefit", "cta"]),
    text: z.string()
  })),
  productImage: z.string().optional()
});

type LeadGenerationReelProps = z.infer<typeof leadGenerationReelSchema>;

export const LeadGenerationReel: React.FC<LeadGenerationReelProps> = ({
  product,
  targetMarket,
  hook,
  headline,
  subheadline,
  cta,
  website,
  scenes,
  productImage
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSecond = frame / fps;

  // Find active scene
  const activeScene = scenes.find(s => currentSecond >= s.start && currentSecond < s.end) || scenes[scenes.length - 1];

  // Subtle zoom on background
  const bgScale = interpolate(frame, [0, 450], [1, 1.1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a", color: "white", fontFamily: "Inter, sans-serif" }}>
      {/* Background Image / Placeholder */}
      <AbsoluteFill style={{ opacity: 0.4, transform: `scale(${bgScale})` }}>
        {productImage ? (
          <Img src={productImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(45deg, #0f172a, #1e293b)" }} />
        )}
      </AbsoluteFill>

      {/* Content Overlay */}
      <AbsoluteFill style={{ padding: "80px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        
        {/* Dynamic Scene Text */}
        <div style={{ 
          fontSize: "80px", 
          fontWeight: "bold", 
          lineHeight: 1.1,
          textShadow: "0px 4px 20px rgba(0,0,0,0.5)",
          marginBottom: "40px"
        }}>
          {activeScene?.text}
        </div>

        {/* Persistent Branding */}
        <AbsoluteFill style={{ justifyContent: "flex-end", padding: "60px", alignItems: "center" }}>
          <div style={{ fontSize: "40px", fontWeight: 600, color: "#38bdf8", marginBottom: "20px" }}>
            Lush Trade Corp
          </div>
          <div style={{ fontSize: "30px", opacity: 0.8 }}>
            {website}
          </div>
        </AbsoluteFill>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
