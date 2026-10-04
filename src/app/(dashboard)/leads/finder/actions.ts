"use server";
import { getAIProvider } from "@/services/ai";

export async function findLeads(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  
  if (!process.env.AI_PROVIDER_API_KEY) {
    throw new Error("AI Provider API key not configured.");
  }
  
  const ai = getAIProvider();
  const result = await ai.generateText(`Identify potential B2B leads for Lush Trade Corp based on this query: ${query}. Return a list of realistic generic companies (do not invent real names/contacts, just explain the profile).`);
  
  return { success: true, result };
}
