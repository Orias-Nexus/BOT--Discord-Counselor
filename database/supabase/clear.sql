-- =============================================================================
-- Clear: Xoá toàn bộ schema DiscordCounselor (bảng, enum, function) — trước khi chạy schema.sql mới
-- Chạy trong Supabase SQL Editor.
-- =============================================================================

DROP SCHEMA IF EXISTS "DiscordCounselor" CASCADE;

-- Extension pgcrypto không xóa. Nếu muốn: DROP EXTENSION IF EXISTS pgcrypto CASCADE;
