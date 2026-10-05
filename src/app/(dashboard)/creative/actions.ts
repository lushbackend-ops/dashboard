"use server";
import { getAIProvider } from "@/services/ai";

export async function generateCreative(prevState: any, formData: FormData) {
  const concept = formData.get("concept") as string;
  const type = formData.get("type") as string;
  
  if (!process.env.AI_PROVIDER_API_KEY) throw new Error("API key not configured.");
  const ai = getAIProvider();
  
  try {
    const additionalInfo = formData.get("additionalInfo") as string;
    const prompt = `You are the lead social media manager for Lush Trade Corp (a B2B commodities trader).
    Create content for a ${type} about: ${concept}.
    Additional info: ${additionalInfo || "None"}
    
    Return exactly this format:
    
    [CAPTION]
    (Write an engaging, professional caption with hashtags)
    
    [AI GENERATOR PROMPT]
    (Write a highly detailed prompt that the user can copy/paste into Midjourney or Runway to generate the perfect image/video for this post. Include Lush Trade Corp branding guidelines: premium, cinematic, professional, global trade, rich colors.)`;

    const result = await ai.generateText(prompt);
    return { success: true, result };
  } catch (error: any) {
    console.error("AI Creative Error:", error);
    const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
    const errorMessage = isQuotaError 
      ? "Google AI Quota Exceeded! Your API key has run out of requests for today." 
      : "Failed to generate creative content. Please try again.";
    return { success: false, result: null, error: errorMessage };
  }
}
