-- NoteCraft AI
-- PostgreSQL initialization schema
-- Scope: MVP + P1 database tables for notes, multimodal inputs, AI jobs,
-- search, review, privacy, and onboarding.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- Enum types
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('free', 'pro', 'team');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'note_status') THEN
        CREATE TYPE note_status AS ENUM ('draft', 'processing', 'ready', 'archived');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_kind_type') THEN
        CREATE TYPE source_kind_type AS ENUM ('text', 'image', 'audio', 'video', 'import');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_asset_type') THEN
        CREATE TYPE media_asset_type AS ENUM ('image', 'audio', 'video');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status_type') THEN
        CREATE TYPE job_status_type AS ENUM ('queued', 'processing', 'success', 'failed');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type_type') THEN
        CREATE TYPE job_type_type AS ENUM (
            'summarize',
            'outline',
            'tag',
            'ocr',
            'asr',
            'retrieve',
            'review_generate',
            'link_notes'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'knowledge_relation_type') THEN
        CREATE TYPE knowledge_relation_type AS ENUM (
            'same_topic',
            'follow_up',
            'contradiction',
            'supplement'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'search_mode_type') THEN
        CREATE TYPE search_mode_type AS ENUM ('keyword', 'semantic', 'ai_chat');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_task_type') THEN
        CREATE TYPE review_task_type AS ENUM ('summary', 'qa', 'highlight', 'compare');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_task_status') THEN
        CREATE TYPE review_task_status AS ENUM ('pending', 'done', 'skipped');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_type_type') THEN
        CREATE TYPE reward_type_type AS ENUM ('points', 'badge', 'skin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'processing_mode_type') THEN
        CREATE TYPE processing_mode_type AS ENUM ('local_first', 'cloud_enhanced');
    END IF;
END $$;

-- =========================================================
-- Common updated_at trigger
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- Users and privacy
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    plan plan_type NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS privacy_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    processing_mode processing_mode_type NOT NULL DEFAULT 'local_first',
    allow_cloud_ai BOOLEAN NOT NULL DEFAULT FALSE,
    encrypt_local_cache BOOLEAN NOT NULL DEFAULT TRUE,
    auto_delete_days INTEGER NOT NULL DEFAULT 30 CHECK (auto_delete_days >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_privacy_settings_updated_at ON privacy_settings;
CREATE TRIGGER trg_privacy_settings_updated_at
BEFORE UPDATE ON privacy_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- Notes domain
-- =========================================================

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status note_status NOT NULL DEFAULT 'draft',
    original_text TEXT,
    cleaned_text TEXT,
    ai_summary TEXT,
    outline_json JSONB,
    source_summary TEXT,
    knowledge_score NUMERIC(5,2),
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    last_opened_at TIMESTAMPTZ,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_notes_updated_at ON notes;
CREATE TRIGGER trg_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS note_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    source_kind source_kind_type NOT NULL,
    source_uri TEXT,
    source_name VARCHAR(255),
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
    asset_type media_asset_type NOT NULL,
    storage_key TEXT NOT NULL,
    file_url TEXT NOT NULL,
    duration_sec INTEGER CHECK (duration_sec IS NULL OR duration_sec >= 0),
    file_size BIGINT CHECK (file_size IS NULL OR file_size >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    full_text TEXT,
    layout_json JSONB,
    status job_status_type NOT NULL DEFAULT 'queued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS asr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    language VARCHAR(20) DEFAULT 'zh',
    full_text TEXT,
    speaker_count INTEGER DEFAULT 1 CHECK (speaker_count >= 1),
    status job_status_type NOT NULL DEFAULT 'queued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS asr_segments (
    id BIGSERIAL PRIMARY KEY,
    asr_result_id UUID NOT NULL REFERENCES asr_results(id) ON DELETE CASCADE,
    start_ms INTEGER NOT NULL CHECK (start_ms >= 0),
    end_ms INTEGER NOT NULL CHECK (end_ms >= start_ms),
    speaker_label VARCHAR(50),
    content TEXT NOT NULL,
    confidence NUMERIC(4,3),
    sort_order INTEGER NOT NULL CHECK (sort_order >= 0)
);

-- =========================================================
-- Tags and note mapping
-- =========================================================

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#6D5EF9',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (note_id, tag_id)
);

-- =========================================================
-- AI jobs and knowledge organization
-- =========================================================

CREATE TABLE IF NOT EXISTS ai_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    job_type job_type_type NOT NULL,
    input_source source_kind_type,
    status job_status_type NOT NULL DEFAULT 'queued',
    result_json JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS note_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    chunk_text TEXT NOT NULL,
    token_count INTEGER CHECK (token_count IS NULL OR token_count >= 0),
    section_title VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (note_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS note_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    chunk_id UUID NOT NULL REFERENCES note_chunks(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    vector_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (chunk_id, model_name)
);

CREATE TABLE IF NOT EXISTS knowledge_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    target_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    relation_type knowledge_relation_type NOT NULL,
    confidence_score NUMERIC(4,3),
    reason_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (source_note_id <> target_note_id),
    UNIQUE (source_note_id, target_note_id, relation_type)
);

-- =========================================================
-- Search domain
-- =========================================================

CREATE TABLE IF NOT EXISTS search_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    search_mode search_mode_type NOT NULL,
    answer_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_hits (
    session_id UUID NOT NULL REFERENCES search_sessions(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    rank_order INTEGER NOT NULL CHECK (rank_order >= 1),
    score NUMERIC(8,4),
    PRIMARY KEY (session_id, note_id)
);

-- =========================================================
-- Review and memory reinforcement
-- =========================================================

CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    difficulty SMALLINT NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating IN (1, 2, 3)),
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_review_at TIMESTAMPTZ,
    interval_days INTEGER NOT NULL DEFAULT 1 CHECK (interval_days >= 0),
    easiness_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,
    repetition_count INTEGER NOT NULL DEFAULT 0 CHECK (repetition_count >= 0)
);

CREATE TABLE IF NOT EXISTS review_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES flashcards(id) ON DELETE SET NULL,
    task_type review_task_type NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    priority SMALLINT NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
    status review_task_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

-- =========================================================
-- Growth, rewards, onboarding
-- =========================================================

CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type reward_type_type NOT NULL,
    reward_name VARCHAR(100) NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1 CHECK (amount >= 0),
    source_action VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_key VARCHAR(50) NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, step_key)
);

-- =========================================================
-- Indexes
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_last_opened_at ON notes(last_opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_sensitive ON notes(user_id, is_sensitive);
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(user_id, status);

CREATE INDEX IF NOT EXISTS idx_note_sources_note_id ON note_sources(note_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_note_id ON media_assets(note_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_results_note_id ON ocr_results(note_id);
CREATE INDEX IF NOT EXISTS idx_asr_results_note_id ON asr_results(note_id);
CREATE INDEX IF NOT EXISTS idx_asr_segments_result_order ON asr_segments(asr_result_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_note_status ON ai_jobs(note_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_created_at ON ai_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_note_chunks_note_id ON note_chunks(note_id);
CREATE INDEX IF NOT EXISTS idx_note_embeddings_note_id ON note_embeddings(note_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_links_source ON knowledge_links(source_note_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_links_target ON knowledge_links(target_note_id);

CREATE INDEX IF NOT EXISTS idx_search_sessions_user_created_at ON search_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_hits_session_rank ON search_hits(session_id, rank_order);

CREATE INDEX IF NOT EXISTS idx_flashcards_note_id ON flashcards(note_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_flashcard_id ON review_logs(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_next_review_at ON review_logs(next_review_at);
CREATE INDEX IF NOT EXISTS idx_review_tasks_user_due_status ON review_tasks(user_id, due_at, status);

CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON rewards(user_id);

-- =========================================================
-- Full-text search helpers for notes and chunks
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_notes_title_fts
ON notes
USING GIN (to_tsvector('simple', COALESCE(title, '')));

CREATE INDEX IF NOT EXISTS idx_notes_content_fts
ON notes
USING GIN (
    to_tsvector(
        'simple',
        COALESCE(title, '') || ' ' ||
        COALESCE(original_text, '') || ' ' ||
        COALESCE(cleaned_text, '') || ' ' ||
        COALESCE(ai_summary, '')
    )
);

CREATE INDEX IF NOT EXISTS idx_note_chunks_text_fts
ON note_chunks
USING GIN (to_tsvector('simple', COALESCE(chunk_text, '')));

COMMIT;

-- =========================================================
-- Suggested next step
-- 1. Map this schema to Prisma models
-- 2. Create seed data for demo notes, tags, flashcards
-- 3. Add pgvector in a follow-up migration when deployed environment supports it
-- =========================================================
