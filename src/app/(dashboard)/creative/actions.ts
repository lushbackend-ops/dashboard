"use server";
import { getAIProvider } from "@/services/ai";

export async function generateCreative(prevState: any, formData: FormData) {
  const concept = formData.get("concept") as string;
  const type = formData.get("type") as string;
  
  if (!process.env.AI_PROVIDER_API_KEY) throw new Error("API key not configured.");
  const ai = getAIProvider();
  
  try {
    const result = await ai.generateText(`Create a ${type} for Lush Trade Corp based on this concept: ${concept}. Keep it engaging and professional for B2B commodity trading.`);
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
