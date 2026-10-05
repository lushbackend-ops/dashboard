"use server";

export async function generateCampaignIdea(prevState: any, formData: FormData) {
  const objective = formData.get("objective") as string;
  return { success: true, result: `Mock campaign idea for: ${objective} (AI disabled)` };
}
