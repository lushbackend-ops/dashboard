"use server";

export async function draftOutreach(prevState: any, formData: FormData) {
  const context = formData.get("context") as string;
  return { success: true, result: `Mock outreach for: ${context} (AI disabled)` };
}
