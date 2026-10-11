-- Migration: 00006_social_publisher
-- Description: Additive tables, enums, indexes, and RLS policies for Social Media Publisher & Scheduler

-- 1. Create Enums if they do not exist
DO $$ BEGIN
    CREATE TYPE social_platform_type AS ENUM ('INSTAGRAM', 'FACEBOOK_PAGE', 'LINKEDIN_ORG');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE social_post_status AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'PARTIALLY_PUBLISHED', 'FAILED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE social_attempt_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'NEEDS_ATTENTION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Connected Social Accounts
-- Note: org_id is optional UUID so it works standalone even if organizations table is not present
CREATE TABLE IF NOT EXISTS social_connected_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID,
    platform social_platform_type NOT NULL,
    account_name TEXT NOT NULL,
    account_id TEXT NOT NULL, -- e.g. Facebook Page ID, Instagram IG User ID, LinkedIn Org URN
    encrypted_access_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_platform_account UNIQUE(platform, account_id)
);

-- 3. Social Posts
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID,
    created_by UUID,
    caption TEXT NOT NULL,
    media_items JSONB DEFAULT '[]'::jsonb, -- [{ url, path, mimeType, size, name }]
    display_timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    scheduled_at TIMESTAMPTZ,
    status social_post_status NOT NULL DEFAULT 'DRAFT',
    claim_worker_id TEXT,
    claim_expires_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Social Post Targets (Platform attempts)
CREATE TABLE IF NOT EXISTS social_post_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    account_id UUID REFERENCES social_connected_accounts(id) ON DELETE SET NULL,
    platform social_platform_type NOT NULL,
    status social_attempt_status NOT NULL DEFAULT 'PENDING',
    remote_post_id TEXT,
    attempt_count INT NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Social Publish Audit Logs
CREATE TABLE IF NOT EXISTS social_publish_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id UUID REFERENCES social_post_targets(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    status social_attempt_status NOT NULL,
    safe_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Indexes for Worker Claims and Post Queries
CREATE INDEX IF NOT EXISTS idx_social_posts_due ON social_posts (status, scheduled_at) 
WHERE status = 'SCHEDULED';

CREATE INDEX IF NOT EXISTS idx_social_posts_claim ON social_posts (claim_worker_id, claim_expires_at);
CREATE INDEX IF NOT EXISTS idx_social_targets_post ON social_post_targets (post_id);

-- 7. Enable Row Level Security
ALTER TABLE social_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_publish_logs ENABLE ROW LEVEL SECURITY;

-- 8. Permissive RLS Policies (Allows dashboard operations and background worker)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public/auth social_connected_accounts" ON social_connected_accounts;
    CREATE POLICY "Allow public/auth social_connected_accounts" ON social_connected_accounts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public/auth social_posts" ON social_posts;
    CREATE POLICY "Allow public/auth social_posts" ON social_posts FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public/auth social_post_targets" ON social_post_targets;
    CREATE POLICY "Allow public/auth social_post_targets" ON social_post_targets FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow public/auth social_publish_logs" ON social_publish_logs;
    CREATE POLICY "Allow public/auth social_publish_logs" ON social_publish_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN undefined_object THEN null;
END $$;
