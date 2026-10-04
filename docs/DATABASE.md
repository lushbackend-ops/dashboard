# Database Architecture
Lush AI Marketing Platform

Database Provider: Supabase (PostgreSQL)

## Core Tables

### Authentication & Authorization
- `users`: Managed mostly by Supabase Auth, extended profile data.
- `organizations`: Multi-tenant structure (initially just Lush).

### Business Brain
- `company_profile`: Core company info, mission, vision.
- `brand_settings`: Tone, colors, typography.
- `products`: RCN, Kernels, Pulses, Coffee, Timber.
- `approved_claims`: Verifiable claims (e.g., CBT Registered) with status (VERIFIED, NEEDS_REVIEW, etc.).
- `knowledge_documents`: Uploaded PDFs, text, website scrapes.
- `knowledge_chunks`: Vector embeddings for RAG.

### Content & Marketing
- `content`: Generated posts, captions, scripts.
- `content_variations`: Platform-specific tweaks.
- `content_calendar`: Scheduled posts and approval states.
- `campaigns`: Marketing campaigns.
- `campaign_content`: Link between campaigns and content.

### CRM & Leads
- `leads`: Companies and individuals discovered.
- `lead_scores`: Scoring records with explanations.
- `lead_notes`: User-added notes.
- `lead_activities`: Interaction history.
- `outreach_messages`: Drafts and sent messages.
- `tasks`: CRM tasks and reminders.

### Analytics & System
- `analytics_events`: Tracking usage and marketing metrics.
- `integrations`: External API configurations.
- `ai_generations`: Audit log of all AI requests and responses.
- `audit_logs`: Security and action logging.

## Security & Access
Row Level Security (RLS) will be strictly enforced on all tables.
