-- Comment2DM PostgreSQL Schema (Neon Compatible)
-- Designed for Vercel Serverless with sslmode=require

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    plan VARCHAR(50) DEFAULT 'Pro',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Instagram Connected Accounts Table
CREATE TABLE IF NOT EXISTS instagram_accounts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    ig_user_id VARCHAR(64) NOT NULL,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    profile_picture_url TEXT,
    encrypted_access_token TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[] DEFAULT ARRAY['instagram_business_basic', 'instagram_business_manage_comments', 'instagram_business_manage_messages'],
    is_connected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'active', -- 'active' | 'paused' | 'draft'
    post_id VARCHAR(255) DEFAULT '',
    post_thumbnail TEXT,
    post_caption TEXT,
    keyword VARCHAR(255) NOT NULL,
    match_type VARCHAR(30) DEFAULT 'contains', -- 'exact' | 'contains'
    case_insensitive BOOLEAN DEFAULT TRUE,
    send_once_per_user BOOLEAN DEFAULT TRUE,
    message TEXT NOT NULL,
    link TEXT NOT NULL,
    tracked_redirect_code VARCHAR(100),
    offer VARCHAR(255),
    public_comment_reply TEXT,
    call_to_action VARCHAR(255),
    qualification_questions JSONB DEFAULT '[]'::jsonb,
    setup_verified BOOLEAN DEFAULT TRUE,
    comments_count INTEGER DEFAULT 0,
    dms_sent_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Message Templates Table
CREATE TABLE IF NOT EXISTS message_templates (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    keyword_suggestion VARCHAR(255) NOT NULL,
    offer VARCHAR(255),
    message TEXT NOT NULL,
    public_comment_reply TEXT,
    call_to_action VARCHAR(255),
    default_link TEXT NOT NULL,
    description TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    qualification_questions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Comment Events Table (Records all incoming Instagram comments)
CREATE TABLE IF NOT EXISTS comment_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    ig_user_id VARCHAR(64) NOT NULL,
    comment_id VARCHAR(128) UNIQUE NOT NULL,
    post_id VARCHAR(128),
    commenter_username VARCHAR(255) NOT NULL,
    commenter_id VARCHAR(128),
    comment_text TEXT NOT NULL,
    comment_timestamp TIMESTAMPTZ NOT NULL,
    is_eligible BOOLEAN DEFAULT TRUE,
    matched_campaign_id VARCHAR(64) REFERENCES campaigns(id) ON DELETE SET NULL,
    matched_keyword VARCHAR(255),
    status VARCHAR(50) DEFAULT 'received', -- 'received' | 'processed' | 'skipped' | 'failed'
    skip_reason VARCHAR(255),
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. DM Events Table (Records private replies and outbound DMs)
CREATE TABLE IF NOT EXISTS dm_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    campaign_id VARCHAR(64) REFERENCES campaigns(id) ON DELETE SET NULL,
    comment_event_id VARCHAR(64) REFERENCES comment_events(id) ON DELETE SET NULL,
    comment_id VARCHAR(128) NOT NULL,
    recipient_username VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    message_id VARCHAR(128),
    status VARCHAR(50) NOT NULL, -- 'Sent successfully' | 'Failed' | 'Demo mode'
    mode VARCHAR(20) DEFAULT 'live', -- 'live' | 'demo'
    rule_violated VARCHAR(50),
    meta_response JSONB,
    error_detail TEXT,
    response_time_ms INTEGER DEFAULT 850,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Link Clicks Table (Immutable recorded clicks through tracked redirects)
CREATE TABLE IF NOT EXISTS link_clicks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    campaign_id VARCHAR(64) REFERENCES campaigns(id) ON DELETE SET NULL,
    redirect_code VARCHAR(100) NOT NULL,
    destination_url TEXT NOT NULL,
    lead_id VARCHAR(64),
    username VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    ip_hash VARCHAR(64),
    clicked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Usage Records Table (Track monthly usage, quota, and audit log)
CREATE TABLE IF NOT EXISTS usage_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    metric VARCHAR(100) NOT NULL, -- 'dm_sent' | 'comment_processed' | 'click_tracked' | 'ai_suggest'
    quantity INTEGER DEFAULT 1,
    period_month VARCHAR(20) NOT NULL, -- e.g. '2026-10'
    metadata JSONB,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Leads Table (CRM Lead Inbox)
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    comment TEXT NOT NULL,
    comment_id VARCHAR(128),
    comment_time TIMESTAMPTZ,
    campaign_id VARCHAR(64) REFERENCES campaigns(id) ON DELETE SET NULL,
    campaign_name VARCHAR(255),
    matched_keyword VARCHAR(255),
    dm_sent TEXT,
    link TEXT,
    status VARCHAR(50) DEFAULT 'New', -- 'New' | 'Interested' | 'Needs follow-up' | 'Link sent' | 'Converted' | 'Not interested'
    notes TEXT DEFAULT '',
    source VARCHAR(255) DEFAULT 'Instagram Comment',
    post_thumbnail TEXT,
    qualification_answers JSONB DEFAULT '[]'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for serverless query performance & deduplication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_comment_events_comment_id ON comment_events(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_events_user_id ON comment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_events_created ON comment_events(created_at);
CREATE INDEX IF NOT EXISTS idx_dm_events_comment_id ON dm_events(comment_id);
CREATE INDEX IF NOT EXISTS idx_dm_events_campaign ON dm_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_dm_events_sent_at ON dm_events(sent_at);
CREATE INDEX IF NOT EXISTS idx_link_clicks_campaign ON link_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_code ON link_clicks(redirect_code);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked ON link_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage_records(user_id, period_month);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
