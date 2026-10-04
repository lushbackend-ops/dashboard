"use server";
import { getAIProvider } from "@/services/ai";

export async function scoreLead(prevState: any, formData: FormData) {
  const leadData = formData.get("lead") as string;
  if (!process.env.AI_PROVIDER_API_KEY) {
    throw new Error("AI Provider API key not configured.");
  }
  
  const ai = getAIProvider();
  try {
    const result = await ai.generateText(`Score this lead for Lush Trade Corp (0-100) and explain why: ${leadData}. Return strictly JSON like {"score": 85, "reason": "Good match"}`);
    return { success: true, result };
  } catch (error: any) {
    console.error("AI CRM Error:", error);
    const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
    const errorMessage = isQuotaError 
      ? "Google AI Quota Exceeded! Your API key has run out of requests for today." 
      : "Failed to analyze lead. Please try again.";
    return { success: false, result: null, error: errorMessage };
  }
}
