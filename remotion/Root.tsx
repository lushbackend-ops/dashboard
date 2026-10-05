import React from "react";
import { Composition } from "remotion";
import { LeadGenerationReel, leadGenerationReelSchema } from "./compositions/LeadGenerationReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LeadGenerationReel"
        component={LeadGenerationReel}
        durationInFrames={450} // 15 seconds at 30 fps
        fps={30}
        width={1080}
        height={1920}
        schema={leadGenerationReelSchema}
        defaultProps={{
          product: "Premium Indian Cashews",
          targetMarket: "UAE",
          hook: "Looking for a reliable Indian cashew supplier?",
          headline: "Premium Indian Cashews",
          subheadline: "Export-ready supply for global buyers",
          cta: "Talk to Lush Trade Corp",
          website: "https://www.lushtradecorp.com",
          scenes: [
            { start: 0, end: 3, type: "hook", text: "Looking for a reliable Indian cashew supplier?" },
            { start: 3, end: 7, type: "product", text: "Premium Indian Cashews" },
            { start: 7, end: 11, type: "benefit", text: "Reliable export-ready supply" },
            { start: 11, end: 15, type: "cta", text: "Talk to Lush Trade Corp" }
          ],
          productImage: "https://images.unsplash.com/photo-1599818815152-cb6bb46d2745?q=80&w=1080&auto=format&fit=crop"
        }}
      />
    </>
  );
};
