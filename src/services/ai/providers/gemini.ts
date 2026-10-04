import { GoogleGenAI } from "@google/genai";
import { AIContext, AIProvider, AnalysisResult, ResearchResult } from "../types";

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.AI_PROVIDER_API_KEY });
  }

  async generateText(prompt: string, context?: AIContext): Promise<string> {
    let retries = 3;
    let delay = 3000;
    while (retries > 0) {
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: context?.systemPrompt,
            temperature: context?.temperature || 0.7,
          },
        });
        return response.text || "";
      } catch (error: any) {
        if ((error?.status === 503 || error?.message?.includes("503")) && retries > 1) {
          console.warn(`Gemini 503 error, retrying in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          throw error;
        }
      }
    }
    return "";
  }

  async generateStructuredOutput<T>(prompt: string, schema: unknown, context?: AIContext): Promise<T> {
    let retries = 3;
    let delay = 3000;
    while (retries > 0) {
      try {
        const response = await this.ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: context?.systemPrompt,
            temperature: context?.temperature || 0.1,
            responseMimeType: "application/json",
          },
        });
        
        // Fix: Clean markdown block formatting before parsing JSON
        let rawText = response.text || "{}";
        rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        return JSON.parse(rawText) as T;
      } catch (error: any) {
        if ((error?.status === 503 || error?.message?.includes("503")) && retries > 1) {
          console.warn(`Gemini 503 error, retrying in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          console.error("Gemini Parse Error:", error);
          throw error;
        }
      }
    }
    throw new Error("Failed to generate structured output after retries.");
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    return response.embeddings?.[0]?.values || [];
  }

  async analyze(data: unknown, context?: AIContext): Promise<AnalysisResult> {
    return this.generateStructuredOutput<AnalysisResult>(
      `Analyze the following data: ${JSON.stringify(data)}`,
      {},
      context
    );
  }
}
