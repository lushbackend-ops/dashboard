"use server";

import { getAIProvider } from "@/services/ai";

export async function generateContent(prevState: any, formData: FormData) {
  const prompt = formData.get("prompt") as string;
  const platform = formData.get("platform") as string;
  
  const ai = getAIProvider();
  const result = await ai.generateText(`Create a ${platform} marketing post for Lush Trade Corp about: ${prompt}. Maintain professional B2B tone. Never invent facts.`);
  
  return { success: true, result };
}
