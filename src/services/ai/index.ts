import { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";

/**
 * Returns the currently configured AI Provider based on environment variables.
 * This ensures the application is not tightly coupled to a single vendor.
 */
export function getAIProvider(): AIProvider {
  if (!process.env.AI_PROVIDER_API_KEY) {
    throw new Error("AI Provider is not configured yet. Please set AI_PROVIDER_API_KEY in .env.local.");
  }
  return new GeminiProvider();
}
