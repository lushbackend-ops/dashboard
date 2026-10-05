"use server";

export async function performResearch(prevState: any, formData: FormData) {
  const query = formData.get("query") as string;
  return { success: true, result: `Mock research results for: ${query} (AI disabled)` };
}
