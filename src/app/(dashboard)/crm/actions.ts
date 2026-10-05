"use server";

export async function scoreLead(prevState: any, formData: FormData) {
  const leadData = formData.get("lead") as string;
  // Mock scoring without AI
  return { success: true, result: JSON.stringify({ score: 85, reason: "Mocked score - AI disabled for this feature" }) };
}
