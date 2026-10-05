"use server";

export async function simulateWebsiteEnquiry(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  return { success: true, result: `Mock response to: ${query} (AI disabled)` };
}
