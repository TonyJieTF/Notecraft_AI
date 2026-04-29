-- CreateEnum
CREATE TYPE "plan_type" AS ENUM ('free', 'pro', 'team');

-- CreateEnum
CREATE TYPE "note_status" AS ENUM ('draft', 'processing', 'ready', 'archived');

-- CreateEnum
CREATE TYPE "source_kind_type" AS ENUM ('text', 'image', 'audio', 'video', 'import');

-- CreateEnum
CREATE TYPE "media_asset_type" AS ENUM ('image', 'audio', 'video');

-- CreateEnum
CREATE TYPE "job_status_type" AS ENUM ('queued', 'processing', 'success', 'failed');

-- CreateEnum
CREATE TYPE "job_type_type" AS ENUM ('summarize', 'outline', 'tag', 'ocr', 'asr', 'retrieve', 'review_generate', 'link_notes');

-- CreateEnum
CREATE TYPE "knowledge_relation_type" AS ENUM ('same_topic', 'follow_up', 'contradiction', 'supplement');

-- CreateEnum
CREATE TYPE "search_mode_type" AS ENUM ('keyword', 'semantic', 'ai_chat');

-- CreateEnum
CREATE TYPE "review_task_type" AS ENUM ('summary', 'qa', 'highlight', 'compare');

-- CreateEnum
CREATE TYPE "review_task_status" AS ENUM ('pending', 'done', 'skipped');

-- CreateEnum
CREATE TYPE "reward_type_type" AS ENUM ('points', 'badge', 'skin');

-- CreateEnum
CREATE TYPE "processing_mode_type" AS ENUM ('local_first', 'cloud_enhanced');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" VARCHAR(100),
    "avatar_url" TEXT,
    "plan" "plan_type" NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "privacy_settings" (
    "user_id" UUID NOT NULL,
    "processing_mode" "processing_mode_type" NOT NULL DEFAULT 'local_first',
    "allow_cloud_ai" BOOLEAN NOT NULL DEFAULT false,
    "encrypt_local_cache" BOOLEAN NOT NULL DEFAULT true,
    "auto_delete_days" INTEGER NOT NULL DEFAULT 30,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "privacy_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "status" "note_status" NOT NULL DEFAULT 'draft',
    "original_text" TEXT,
    "cleaned_text" TEXT,
    "ai_summary" TEXT,
    "outline_json" JSONB,
    "source_summary" TEXT,
    "knowledge_score" DECIMAL(5,2),
    "is_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "last_opened_at" TIMESTAMPTZ(6),
    "last_reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note_id" UUID NOT NULL,
    "source_kind" "source_kind_type" NOT NULL,
    "source_uri" TEXT,
    "source_name" VARCHAR(255),
    "mime_type" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "note_id" UUID,
    "asset_type" "media_asset_type" NOT NULL,
    "storage_key" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "duration_sec" INTEGER,
    "file_size" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocr_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_asset_id" UUID NOT NULL,
    "note_id" UUID NOT NULL,
    "full_text" TEXT,
    "layout_json" JSONB,
    "status" "job_status_type" NOT NULL DEFAULT 'queued',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),

    CONSTRAINT "ocr_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asr_results" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_asset_id" UUID NOT NULL,
    "note_id" UUID NOT NULL,
    "language" VARCHAR(20) DEFAULT 'zh',
    "full_text" TEXT,
    "speaker_count" INTEGER NOT NULL DEFAULT 1,
    "status" "job_status_type" NOT NULL DEFAULT 'queued',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),

    CONSTRAINT "asr_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asr_segments" (
    "id" BIGSERIAL NOT NULL,
    "asr_result_id" UUID NOT NULL,
    "start_ms" INTEGER NOT NULL,
    "end_ms" INTEGER NOT NULL,
    "speaker_label" VARCHAR(50),
    "content" TEXT NOT NULL,
    "confidence" DECIMAL(4,3),
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "asr_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20) NOT NULL DEFAULT '#6D5EF9',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_tags" (
    "note_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_tags_pkey" PRIMARY KEY ("note_id","tag_id")
);

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "note_id" UUID,
    "job_type" "job_type_type" NOT NULL,
    "input_source" "source_kind_type",
    "status" "job_status_type" NOT NULL DEFAULT 'queued',
    "result_json" JSONB,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "token_count" INTEGER,
    "section_title" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_embeddings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note_id" UUID NOT NULL,
    "chunk_id" UUID NOT NULL,
    "model_name" VARCHAR(100) NOT NULL,
    "vector_ref" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "source_note_id" UUID NOT NULL,
    "target_note_id" UUID NOT NULL,
    "relation_type" "knowledge_relation_type" NOT NULL,
    "confidence_score" DECIMAL(4,3),
    "reason_text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "query_text" TEXT NOT NULL,
    "search_mode" "search_mode_type" NOT NULL,
    "answer_summary" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_hits" (
    "session_id" UUID NOT NULL,
    "note_id" UUID NOT NULL,
    "rank_order" INTEGER NOT NULL,
    "score" DECIMAL(8,4),

    CONSTRAINT "search_hits_pkey" PRIMARY KEY ("session_id","note_id")
);

-- CreateTable
CREATE TABLE "flashcards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "note_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "flashcard_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_review_at" TIMESTAMPTZ(6),
    "interval_days" INTEGER NOT NULL DEFAULT 1,
    "easiness_factor" DECIMAL(4,2) NOT NULL DEFAULT 2.50,
    "repetition_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "note_id" UUID,
    "flashcard_id" UUID,
    "task_type" "review_task_type" NOT NULL,
    "due_at" TIMESTAMPTZ(6) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 2,
    "status" "review_task_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),

    CONSTRAINT "review_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "reward_type" "reward_type_type" NOT NULL,
    "reward_name" VARCHAR(100) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "source_action" VARCHAR(30),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_progress" (
    "user_id" UUID NOT NULL,
    "step_key" VARCHAR(50) NOT NULL,
    "completed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("user_id","step_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_notes_user_id" ON "notes"("user_id");

-- CreateIndex
CREATE INDEX "idx_notes_updated_at" ON "notes"("updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notes_last_opened_at" ON "notes"("last_opened_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notes_sensitive" ON "notes"("user_id", "is_sensitive");

-- CreateIndex
CREATE INDEX "idx_notes_status" ON "notes"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_note_sources_note_id" ON "note_sources"("note_id");

-- CreateIndex
CREATE INDEX "idx_media_assets_note_id" ON "media_assets"("note_id");

-- CreateIndex
CREATE INDEX "idx_media_assets_user_id" ON "media_assets"("user_id");

-- CreateIndex
CREATE INDEX "idx_ocr_results_note_id" ON "ocr_results"("note_id");

-- CreateIndex
CREATE INDEX "idx_asr_results_note_id" ON "asr_results"("note_id");

-- CreateIndex
CREATE INDEX "idx_asr_segments_result_order" ON "asr_segments"("asr_result_id", "sort_order");

-- CreateIndex
CREATE INDEX "idx_tags_user_id" ON "tags"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_note_tags_tag_id" ON "note_tags"("tag_id");

-- CreateIndex
CREATE INDEX "idx_ai_jobs_note_status" ON "ai_jobs"("note_id", "status");

-- CreateIndex
CREATE INDEX "idx_ai_jobs_user_created_at" ON "ai_jobs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_note_chunks_note_id" ON "note_chunks"("note_id");

-- CreateIndex
CREATE UNIQUE INDEX "note_chunks_note_id_chunk_index_key" ON "note_chunks"("note_id", "chunk_index");

-- CreateIndex
CREATE INDEX "idx_note_embeddings_note_id" ON "note_embeddings"("note_id");

-- CreateIndex
CREATE UNIQUE INDEX "note_embeddings_chunk_id_model_name_key" ON "note_embeddings"("chunk_id", "model_name");

-- CreateIndex
CREATE INDEX "idx_knowledge_links_source" ON "knowledge_links"("source_note_id");

-- CreateIndex
CREATE INDEX "idx_knowledge_links_target" ON "knowledge_links"("target_note_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_links_source_note_id_target_note_id_relation_type_key" ON "knowledge_links"("source_note_id", "target_note_id", "relation_type");

-- CreateIndex
CREATE INDEX "idx_search_sessions_user_created_at" ON "search_sessions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_search_hits_session_rank" ON "search_hits"("session_id", "rank_order");

-- CreateIndex
CREATE INDEX "idx_flashcards_note_id" ON "flashcards"("note_id");

-- CreateIndex
CREATE INDEX "idx_flashcards_user_id" ON "flashcards"("user_id");

-- CreateIndex
CREATE INDEX "idx_review_logs_flashcard_id" ON "review_logs"("flashcard_id");

-- CreateIndex
CREATE INDEX "idx_review_logs_next_review_at" ON "review_logs"("next_review_at");

-- CreateIndex
CREATE INDEX "idx_review_tasks_user_due_status" ON "review_tasks"("user_id", "due_at", "status");

-- CreateIndex
CREATE INDEX "idx_rewards_user_id" ON "rewards"("user_id");

-- AddForeignKey
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_sources" ADD CONSTRAINT "note_sources_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocr_results" ADD CONSTRAINT "ocr_results_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocr_results" ADD CONSTRAINT "ocr_results_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asr_results" ADD CONSTRAINT "asr_results_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asr_results" ADD CONSTRAINT "asr_results_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asr_segments" ADD CONSTRAINT "asr_segments_asr_result_id_fkey" FOREIGN KEY ("asr_result_id") REFERENCES "asr_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_chunks" ADD CONSTRAINT "note_chunks_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_embeddings" ADD CONSTRAINT "note_embeddings_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_embeddings" ADD CONSTRAINT "note_embeddings_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "note_chunks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_links" ADD CONSTRAINT "knowledge_links_source_note_id_fkey" FOREIGN KEY ("source_note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_links" ADD CONSTRAINT "knowledge_links_target_note_id_fkey" FOREIGN KEY ("target_note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_sessions" ADD CONSTRAINT "search_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_hits" ADD CONSTRAINT "search_hits_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "search_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_hits" ADD CONSTRAINT "search_hits_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_logs" ADD CONSTRAINT "review_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_flashcard_id_fkey" FOREIGN KEY ("flashcard_id") REFERENCES "flashcards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
