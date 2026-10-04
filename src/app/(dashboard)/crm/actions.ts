"use server";
import { getAIProvider } from "@/services/ai";

export async function scoreLead(prevState: any, formData: FormData) {
  const leadData = formData.get("lead") as string;
  if (!process.env.AI_PROVIDER_API_KEY) {
    throw new Error("AI Provider API key not configured.");
  }
  
  const ai = getAIProvider();
  const result = await ai.generateText(`Score this lead for Lush Trade Corp (0-100) and explain why: ${leadData}. Return strictly JSON like {"score": 85, "reason": "Good match"}`);
  
  return { success: true, result };
}
