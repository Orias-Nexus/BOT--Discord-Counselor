-- Active: 1776947138491@@aws-1-ap-southeast-2.pooler.supabase.com@5432@postgres@discordtesting
-- =============================================================================
-- Seed Supabase — Levels + Functions (script, slash, action, event)
-- Chạy sau schema.sql. Nội dung embed của từng lệnh hardcode trong directive (embedDefaults.js).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Levels: 1000 levels từ 0 đến 999
-- -----------------------------------------------------------------------------
INSERT INTO "DiscordCounselor".levels (level_id, level, exp)
SELECT "DiscordCounselor".uuidv7(), s.i, CASE WHEN s.i = 0 THEN 0 ELSE 100 * s.i * (s.i + 1) / 2 END
FROM generate_series(0, 999) AS s(i)
ON CONFLICT (level) DO NOTHING;

