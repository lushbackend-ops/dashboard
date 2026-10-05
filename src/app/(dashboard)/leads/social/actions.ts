"use server";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function findLeads(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  
  // Return mocked leads
  return {
    success: true,
    error: undefined,
    leads: [
      {
        company_name: "Mock Company Ltd",
        contact_email: "mock@company.com",
        phone: "+1234567890",
        product: "Mock Product",
        message: "This is a mocked lead (AI disabled)"
      }
    ]
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
    message: `[Source: Social Lead Finder] ${lead.message}`,
    status: "New",
    score: Math.floor(Math.random() * 40) + 60
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/crm");
}
