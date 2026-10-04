"use server";
import { getAIProvider } from "@/services/ai";

export async function performResearch(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  
  if (!process.env.AI_PROVIDER_API_KEY) {
    throw new Error("AI Provider API key not configured.");
  }
  
  const ai = getAIProvider();
  try {
    const result = await ai.generateText(`Perform market intelligence research for Lush Trade Corp on the following query: ${query}. Return structured findings including evidence, sources, and a confidence level. Ensure realistic B2B constraints.`);
    return { success: true, result };
  } catch (error: any) {
    console.error("AI Research Error:", error);
    const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
    const errorMessage = isQuotaError 
      ? "Google AI Quota Exceeded! Your API key has run out of requests for today." 
      : "Failed to generate research. Please try again.";
    return { success: false, result: null, error: errorMessage };
  }
}
