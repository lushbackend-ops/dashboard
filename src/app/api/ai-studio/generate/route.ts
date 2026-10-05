import { NextResponse } from "next/server";
import { getAIProvider } from "@/services/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product, targetMarket, contentType, campaignGoal, duration, tone, cta, instructions } = body;

    const ai = getAIProvider();

    // System prompt based on instructions
    const prompt = `You are a premium B2B AI Video Director for Lush Trade Corp.
Create a structured JSON for a ${duration}-second ${contentType}.
Product: ${product}
Target Market: ${targetMarket}
Campaign Goal: ${campaignGoal}
Tone: ${tone}
CTA: ${cta}
Additional Instructions: ${instructions || "None"}

Generate realistic, high-converting marketing copy. The scenes array must map out exactly ${duration} seconds of video (e.g., 0-3, 3-7, etc.).
Ensure the returned JSON perfectly matches this interface:
{
  "template": string (e.g. "lead-generation-reel"),
  "platform": string (e.g. "instagram"),
  "duration": number,
  "product": string,
  "targetMarket": string,
  "hook": string,
  "headline": string,
  "subheadline": string,
  "cta": string,
  "website": string,
  "scenes": Array<{ start: number, end: number, type: "hook"|"product"|"benefit"|"cta", text: string }>,
  "caption": string,
  "hashtags": string[]
}
Return ONLY valid JSON.`;

    const data = await ai.generateStructuredOutput<any>(prompt, null);

    if (!data || !data.scenes) {
      return NextResponse.json({ error: "Failed to generate structured content" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("AI Studio Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 });
  }
}
