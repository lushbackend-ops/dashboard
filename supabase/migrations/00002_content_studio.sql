-- Migration: 00002_content_studio
-- Description: Sets up the schema for the Content Studio.

CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    platform TEXT NOT NULL,
    result TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft', -- Idea, Draft, Needs Review, Approved, Published
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;
-- Note: RLS Policies omitted for brevity, add when auth is fully wired.
