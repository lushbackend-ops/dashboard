import { GoogleGenAI } from "@google/genai";
import { AIContext, AIProvider, AnalysisResult, ResearchResult } from "../types";
import { logUsage } from "../../usageTracker";

let globalKeyIndex = 0;

export class GeminiProvider implements AIProvider {
  private ais: GoogleGenAI[];
  private keys: string[];

  constructor() {
    let keys = [process.env.AI_PROVIDER_API_KEY].filter(Boolean).map(k => k!.replace(/"/g, '')) as string[];
    
    if (process.env.AI_PROVIDER_API_KEYS) {
      const splitKeys = process.env.AI_PROVIDER_API_KEYS.split(",").map(k => k.trim().replace(/"/g, '')).filter(Boolean);
      if (splitKeys.length > 0) {
        keys = splitKeys;
      }
    }

    if (keys.length === 0) keys = [""]; // fallback

    this.keys = keys;
    this.ais = keys.map(key => new GoogleGenAI({ apiKey: key }));
  }

  async generateText(prompt: string, context?: AIContext): Promise<string> {
    let retries = Math.max(3, this.ais.length);
    let delay = 1000;
    let lastError: any = null;
    while (retries > 0) {
      try {
        const ai = this.ais[globalKeyIndex];
        const key = this.keys[globalKeyIndex];
        
        const config: any = { temperature: context?.temperature || 0.7 };
        if (context?.systemPrompt) config.systemInstruction = context.systemPrompt;
        
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config,
        });
        
        await logUsage(key);
        
        return response.text || "";
      } catch (error: any) {
        lastError = error;
        const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
        
        if (isQuotaError && this.ais.length > 1) {
          console.warn(`[Key ${globalKeyIndex + 1}/${this.ais.length}] Quota exceeded. Rotating to next key...`);
          globalKeyIndex = (globalKeyIndex + 1) % this.ais.length;
          retries--;
          continue; // Retry instantly with the new key
        }

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
    throw lastError || new Error("Failed to generate text after retries.");
  }

  async generateStructuredOutput<T>(prompt: string, schema: unknown, context?: AIContext): Promise<T> {
    let retries = Math.max(3, this.ais.length);
    let delay = 1000;
    let lastError: any = null;
    while (retries > 0) {
      try {
        const ai = this.ais[globalKeyIndex];
        const key = this.keys[globalKeyIndex];
        const config: any = {
          temperature: context?.temperature || 0.1,
          responseMimeType: "application/json",
        };
        if (context?.systemPrompt) config.systemInstruction = context.systemPrompt;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config,
        });
        
        await logUsage(key);
        
        let rawText = response.text || "{}";
        rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        return JSON.parse(rawText) as T;
      } catch (error: any) {
        lastError = error;
        const isQuotaError = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("429");
        
        if (isQuotaError && this.ais.length > 1) {
          console.warn(`[Key ${globalKeyIndex + 1}/${this.ais.length}] Quota exceeded. Rotating to next key...`);
          globalKeyIndex = (globalKeyIndex + 1) % this.ais.length;
          retries--;
          continue;
        }

        if ((error?.status === 503 || error?.message?.includes("503")) && retries > 1) {
          console.warn(`Gemini 503 error, retrying in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          delay *= 2;
        } else {
          console.error("Gemini Parse/API Error:", error);
          throw error;
        }
      }
    }
    throw lastError || new Error("Failed to generate structured output after retries.");
  }

  async createEmbedding(text: string): Promise<number[]> {
    const ai = this.ais[globalKeyIndex];
    const response = await ai.models.embedContent({
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
