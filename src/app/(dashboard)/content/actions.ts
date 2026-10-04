"use server";

import { getAIProvider } from "@/services/ai";

export async function generateContent(prevState: any, formData: FormData) {
  const prompt = formData.get("prompt") as string;
  const platform = formData.get("platform") as string;
  
  const ai = getAIProvider();
  try {
    const result = await ai.generateText(`Create a ${platform} marketing post for Lush Trade Corp about: ${prompt}. Maintain professional B2B tone. Never invent facts.`);
    return { success: true, result };
  } catch (error: any) {
    console.error("AI Content Error:", error);
    const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
    const errorMessage = isQuotaError 
      ? "Google AI Quota Exceeded! Your API key has run out of requests for today." 
      : "Failed to generate content. Please try again.";
    return { success: false, result: null, error: errorMessage };
  }
}
