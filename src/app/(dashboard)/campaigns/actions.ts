"use server";
import { getAIProvider } from "@/services/ai";

export async function generateCampaignIdea(prevState: any, formData: FormData) {
  const objective = formData.get("objective") as string;
  if (!process.env.AI_PROVIDER_API_KEY) throw new Error("API key not configured.");
  const ai = getAIProvider();
  
  const result = await ai.generateText(`Create a B2B marketing campaign idea for Lush Trade Corp. The objective is: ${objective}. Return the campaign name, target audience, and 3 core messaging points.`);
  
  return { success: true, result };
}
