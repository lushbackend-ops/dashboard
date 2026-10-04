export interface AIContext {
  systemPrompt?: string;
  businessBrainContext?: string[];
  temperature?: number;
  maxTokens?: number;
}

export interface AnalysisResult {
  summary: string;
  implications: string[];
  recommendations: string[];
  confidence: number;
}

export interface ResearchResult {
  source: string;
  url?: string;
  date: string;
  evidence: string;
  confidence: number;
  summary: string;
  implications: string[];
  recommendedAction: string;
}

export interface AIProvider {
  /**
   * Generate raw text for content generation, outreach, etc.
   */
  generateText(prompt: string, context?: AIContext): Promise<string>;

  /**
   * Generate structured data from a prompt (e.g., for lead scoring reasoning).
   */
  generateStructuredOutput<T>(prompt: string, schema: unknown, context?: AIContext): Promise<T>;

  /**
   * Create vector embeddings for semantic search in pgvector.
   */
  createEmbedding(text: string): Promise<number[]>;

  /**
   * Analyze raw data and return structured analysis.
   */
  analyze(data: unknown, context?: AIContext): Promise<AnalysisResult>;
}
