"use server";
import { getAIProvider } from "@/services/ai";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function findLeads(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  const category = formData.get("category") as string || "General B2B";

  if (!process.env.AI_PROVIDER_API_KEY) {
    throw new Error("AI Provider API key not configured.");
  }

  const ai = getAIProvider();
  let data = null;

  try {
    // Ask AI to generate realistic mock leads
    data = await ai.generateStructuredOutput<{
      leads: Array<{
        company_name: string;
        contact_email: string;
        phone: string;
        location: string;
        product: string;
        message: string;
      }>
    }>(
      `Generate 3 highly realistic, professional B2B leads based on this market query: "${query}" in the "${category}" industry.
       Make them look like real companies operating in the ${category} sector. 
       Return JSON with an array called "leads". Each lead must have company_name, contact_email, phone, location, product, and message.`,
      null
    );
  } catch (error: any) {
    console.error("AI Error:", error);
    let errorMessage = "Failed to generate leads with AI.";
    if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429")) {
      errorMessage = "Google AI Quota Exceeded! Your free API key is out of credits for today. Please wait until tomorrow or upgrade your Gemini API plan.";
    } else {
      errorMessage = `AI Error: ${error?.message || "Unknown error occurred"}`;
    }
    return { success: false, leads: null, error: errorMessage };
  }

  if (!data || !data.leads || data.leads.length === 0) {
    return { success: false, leads: null, error: "AI returned an empty list. Try a different query." };
  }

  return {
    success: true,
    leads: data.leads
  };
}

export async function saveLeadToCRM(lead: {
  company_name: string;
  contact_email: string;
  phone: string;
  product: string;
  message: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    company_name: lead.company_name,
    contact_email: lead.contact_email,
    phone: lead.phone,
    product: lead.product,
    message: `[Source: AI Lead Finder] ${lead.message}`,
    status: "New",
    score: Math.floor(Math.random() * 40) + 60
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/crm");
}

export async function getSuggestedLeads() {
  if (!process.env.AI_PROVIDER_API_KEY) {
    return null;
  }
  const ai = getAIProvider();
  try {
    const data = await ai.generateStructuredOutput<{
      leads: Array<{
        company_name: string;
        contact_email: string;
        phone: string;
        location: string;
        product: string;
        message: string;
      }>
    }>(
      `Generate 3 highly realistic, professional B2B leads that could serve as diverse, interesting examples. 
       Make them look like real companies from various industries. 
       Return JSON with an array called "leads". Each lead must have company_name, contact_email, phone, location, product, and message.`,
      null
    );
    return data?.leads || null;
  } catch (error) {
    console.error("AI Error generating suggestions:", error);
    return null;
  }
}
