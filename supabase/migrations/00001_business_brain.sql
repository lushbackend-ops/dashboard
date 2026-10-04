-- Migration: 00001_business_brain
-- Description: Sets up the initial schema for the AI Business Brain.

-- Enable pgvector for storing AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations (Multi-tenant support)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company Profile
CREATE TABLE company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    vision TEXT,
    mission TEXT,
    goals TEXT,
    headquarters TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    moq TEXT,
    specifications JSONB,
    origins TEXT[],
    season TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approved Claims (Verification system)
CREATE TYPE claim_status AS ENUM ('VERIFIED', 'NEEDS_REVIEW', 'UNVERIFIED', 'EXPIRED');

CREATE TABLE approved_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    status claim_status NOT NULL DEFAULT 'UNVERIFIED',
    source TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Documents & Chunks for RAG
CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_url TEXT,
    content_type TEXT NOT NULL, -- e.g., 'PDF', 'WEBSITE', 'TEXT'
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536), -- 1536 is standard for OpenAI ada-002. Use 768 for some others.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Basic RLS setup (Example)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE approved_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Note: RLS Policies should be added here restricting access based on user's org_id.
