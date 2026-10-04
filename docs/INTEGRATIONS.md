# Integrations Strategy
Lush AI Marketing Platform

## Core Principle
Do NOT build integrations based on assumptions. Verify API capabilities, authentication, documentation, and limitations BEFORE writing implementation code. Create configuration placeholders if an integration is unavailable.

## Planned Integrations

### 1. Supabase
- **Purpose**: Database, Auth, Storage, Edge Functions.
- **Status**: Core requirement. Verified.

### 2. AI Provider
- **Purpose**: LLM capabilities for Content, Research, Outreach.
- **Strategy**: Abstracted layer. Initially integrate OpenAI or Gemini, but allow swapping.

### 3. Canva
- **Purpose**: Creative asset generation.
- **Verification Needed**: Must verify API capabilities for developers (not just consumer Canva Pro) before building.

### 4. Web Research Provider
- **Purpose**: Live market research (e.g., Perplexity, Tavily, or Serper).
- **Verification Needed**: Assess cost, rate limits, and response accuracy.

### 5. Email Provider
- **Purpose**: Outbound campaigns (e.g., SendGrid, Resend).
- **Requirement**: Must enforce HUMAN APPROVAL before sending.

### 6. Social Platforms (Meta, LinkedIn, YouTube)
- **Purpose**: Content publishing.
- **Verification Needed**: OAuth flows and API restrictions.

### 7. Automation (n8n)
- **Purpose**: Workflow automation.
- **Verification Needed**: Self-hosted vs Cloud webhook capabilities.
