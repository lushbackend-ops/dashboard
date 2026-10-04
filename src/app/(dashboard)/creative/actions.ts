"use server";
import { getAIProvider } from "@/services/ai";

export async function generateCreative(prevState: any, formData: FormData) {
  const concept = formData.get("concept") as string;
  const type = formData.get("type") as string;
  
  if (!process.env.AI_PROVIDER_API_KEY) throw new Error("API key not configured.");
  const ai = getAIProvider();
  
  const result = await ai.generateText(`Create a ${type} for Lush Trade Corp based on this concept: ${concept}. Keep it engaging and professional for B2B commodity trading.`);
  
  return { success: true, result };
}
