"use server";
import { getAIProvider } from "@/services/ai";

export async function simulateWebsiteEnquiry(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  if (!process.env.AI_PROVIDER_API_KEY) throw new Error("API key not configured.");
  const ai = getAIProvider();
  
  const result = await ai.generateText(`You are the website assistant for Lush Trade Corp. Answer this visitor enquiry strictly using professional B2B tone. If you do not know the answer, say "Please contact the Lush Trade Corp team for confirmation." Enquiry: ${query}`);
  
  return { success: true, result };
}
