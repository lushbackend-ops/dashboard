"use server";
import { getAIProvider } from "@/services/ai";

export async function simulateWebsiteEnquiry(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  if (!process.env.AI_PROVIDER_API_KEY) throw new Error("API key not configured.");
  const ai = getAIProvider();
  
  try {
    const result = await ai.generateText(`You are the website assistant for Lush Trade Corp. Answer this visitor enquiry strictly using professional B2B tone. If you do not know the answer, say "Please contact the Lush Trade Corp team for confirmation." Enquiry: ${query}`);
    return { success: true, result };
  } catch (error: any) {
    console.error("AI Website Error:", error);
    const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
    const errorMessage = isQuotaError 
      ? "Google AI Quota Exceeded! Your API key has run out of requests for today." 
      : "Failed to generate response. Please try again.";
    return { success: false, result: null, error: errorMessage };
  }
}
