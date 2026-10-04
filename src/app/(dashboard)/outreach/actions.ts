"use server";
import { getAIProvider } from "@/services/ai";

export async function draftOutreach(prevState: any, formData: FormData) {
  const context = formData.get("context") as string;
  if (!process.env.AI_PROVIDER_API_KEY) throw new Error("API key not configured.");
  const ai = getAIProvider();
  
  try {
    const result = await ai.generateText(`Write a professional B2B outreach message for a potential buyer for Lush Trade Corp. Context: ${context}. Keep it concise and focused on agricultural commodity export.`);
    return { success: true, result };
  } catch (error: any) {
    console.error("AI Outreach Error:", error);
    const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
    const errorMessage = isQuotaError 
      ? "Google AI Quota Exceeded! Your API key has run out of requests for today." 
      : "Failed to generate outreach message. Please try again.";
    return { success: false, result: null, error: errorMessage };
  }
}
