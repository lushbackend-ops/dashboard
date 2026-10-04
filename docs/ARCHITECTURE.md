# Architecture Document
Lush AI Marketing Platform

## Technology Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions and API routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Abstraction**: Custom AI Provider Abstraction Layer to avoid tight coupling

## AI Architecture
The platform will utilize an abstract AI provider interface. This ensures we are not locked into a single model or provider (e.g., OpenAI, Anthropic, Gemini).

```typescript
interface AIProvider {
  generateText(prompt: string, context: AIContext): Promise<string>;
  generateStructuredOutput<T>(prompt: string, schema: T): Promise<T>;
  createEmbedding(text: string): Promise<number[]>;
  analyze(data: any): Promise<AnalysisResult>;
  research(query: string): Promise<ResearchResult>;
}
```

## System Components
1. **Dashboard Shell**: Next.js layout with navigation and authentication state.
2. **AI Business Brain**: Context retrieval system using PostgreSQL pgvector for embeddings, serving verified company data to the AI.
3. **CRM & Lead Finder**: Standard relational CRUD modules backed by Supabase with advanced filtering.
4. **Content & Creative Studio**: Workflows for generating, reviewing, and approving AI-generated marketing assets.

## UI/UX Direction
- Premium, modern B2B SaaS feel.
- Restrained colors, excellent typography (e.g., Inter), clean cards.
- Mobile-responsive, desktop-first workspace.
- Clear empty states rather than fake placeholder data.
