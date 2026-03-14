-- =============================================================================
-- Schema Supabase — Theo Architecture.json (schema "DiscordCounselor")
-- Chạy trong Supabase SQL Editor hoặc migration.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS "DiscordCounselor";

-- -----------------------------------------------------------------------------
-- UUID v7 — Time-ordered UUID (sắp xếp theo thời gian tạo)
-- Thuộc schema DiscordCounselor.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "DiscordCounselor".uuidv7() RETURNS uuid
LANGUAGE sql
VOLATILE
SET search_path = pg_catalog
AS $$
  SELECT (
    substring(hex FROM 1 FOR 8) || '-' ||
    substring(hex FROM 9 FOR 4) || '-' ||
    substring(hex FROM 13 FOR 4) || '-' ||
    substring(hex FROM 17 FOR 4) || '-' ||
    substring(hex FROM 21 FOR 12)
  )::uuid
  FROM (
    SELECT encode(
      substring(int8send(floor(t_ms)::bigint) FROM 3 FOR 6) ||
      int2send(((7 << 12)::int2 | ((t_ms - floor(t_ms)) * 4096)::int2)) ||
      substring(uuid_send(gen_random_uuid()) FROM 9 FOR 8),
      'hex'
    ) AS hex
    FROM (SELECT extract(epoch FROM clock_timestamp()) * 1000 AS t_ms) s
  ) s;
$$;

COMMENT ON FUNCTION "DiscordCounselor".uuidv7() IS 'UUID v7 time-ordered (RFC 9562). Thuộc schema DiscordCounselor.';

-- -----------------------------------------------------------------------------
-- ENUM: Member Status (Architecture.json Database.Enum)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE "DiscordCounselor".member_status_enum AS ENUM (
        'Newbie',
        'Good',
        'Warn',
        'Mute',
        'Lock',
        'Kick',
        'leaved'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE "DiscordCounselor".member_status_enum IS 'Trạng thái thành viên trong server';

-- -----------------------------------------------------------------------------
-- Functions — Định dạng embed của lệnh, tính năng, tin nhắn chung/mặc định
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".functions (
    script_id   UUID PRIMARY KEY DEFAULT "DiscordCounselor".uuidv7(),
    script      TEXT NOT NULL UNIQUE,
    slash       TEXT,
    action      TEXT,
    event       TEXT,
    embed       JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "DiscordCounselor".functions IS 'Định dạng embed của các lệnh, tính năng, tin nhắn chung/mặc định';
COMMENT ON COLUMN "DiscordCounselor".functions.script IS 'Tên tính năng (script)';
COMMENT ON COLUMN "DiscordCounselor".functions.slash IS 'Lệnh slash (ví dụ /server_info)';
COMMENT ON COLUMN "DiscordCounselor".functions.action IS 'Tên action (nút giao diện)';
COMMENT ON COLUMN "DiscordCounselor".functions.event IS 'Tên event';
COMMENT ON COLUMN "DiscordCounselor".functions.embed IS 'JSON: { "replyType": "embed"|"ephemeral", "builder"?: string, "content"?: string }.';
COMMENT ON COLUMN "DiscordCounselor".functions.created_at IS 'Thời gian tạo; UUID v7 đã sắp xếp theo thời gian (ORDER BY script_id)';

-- -----------------------------------------------------------------------------
-- Levels — Định nghĩa các mốc điểm yêu cầu cho các level
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".levels (
    level_id   UUID PRIMARY KEY DEFAULT "DiscordCounselor".uuidv7(),
    level      INTEGER NOT NULL UNIQUE,
    exp        BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "DiscordCounselor".levels IS 'Định nghĩa các mốc điểm yêu cầu cho các level';
COMMENT ON COLUMN "DiscordCounselor".levels.created_at IS 'Thời gian tạo; UUID v7 nên ORDER BY level_id cũng gần thứ tự tạo';

-- -----------------------------------------------------------------------------
-- Servers — Thông tin server (Discord guild)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".servers (
    server_id      TEXT PRIMARY KEY,
    time_warn      INTEGER NOT NULL DEFAULT 0,
    time_mute      INTEGER NOT NULL DEFAULT 0,
    time_lock      INTEGER NOT NULL DEFAULT 0,
    time_new       INTEGER NOT NULL DEFAULT 0,
    role_warn      TEXT,
    role_mute      TEXT,
    role_lock      TEXT,
    role_new       TEXT,
    unrole_mute    TEXT,
    unrole_lock    TEXT,
    channel_greet  TEXT,
    channel_leave  TEXT,
    channel_boost  TEXT,
    channel_logs   TEXT,
    message_great  TEXT,
    message_leave  TEXT,
    message_boost  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "DiscordCounselor".servers IS 'Thông tin server (Discord guild)';
COMMENT ON COLUMN "DiscordCounselor".servers.time_warn IS 'Thời gian tồn tại Warning (phút); 0 = vô hạn';
COMMENT ON COLUMN "DiscordCounselor".servers.time_mute IS 'Thời gian tồn tại Mute (phút); 0 = vô hạn';
COMMENT ON COLUMN "DiscordCounselor".servers.time_lock IS 'Thời gian tồn tại Lock (phút); 0 = vô hạn';
COMMENT ON COLUMN "DiscordCounselor".servers.role_warn IS 'Role được gắn khi nhận Warn';
COMMENT ON COLUMN "DiscordCounselor".servers.role_mute IS 'Role được gắn khi nhận Mute';
COMMENT ON COLUMN "DiscordCounselor".servers.role_lock IS 'Role được gắn khi nhận Lock';
COMMENT ON COLUMN "DiscordCounselor".servers.time_new IS 'Thời gian tồn tại Newbie (phút); 0 = vô hạn';
COMMENT ON COLUMN "DiscordCounselor".servers.role_new IS 'Role được gắn khi Newbie';
COMMENT ON COLUMN "DiscordCounselor".servers.unrole_mute IS 'Role bị gỡ khi nhận Mute';
COMMENT ON COLUMN "DiscordCounselor".servers.unrole_lock IS 'Role bị gỡ khi nhận Lock';
COMMENT ON COLUMN "DiscordCounselor".servers.channel_greet IS 'Kênh tin nhắn chào mừng';
COMMENT ON COLUMN "DiscordCounselor".servers.channel_leave IS 'Kênh tin nhắn tạm biệt';
COMMENT ON COLUMN "DiscordCounselor".servers.channel_boost IS 'Kênh thông báo nâng cấp';
COMMENT ON COLUMN "DiscordCounselor".servers.channel_logs IS 'Kênh log khác';
COMMENT ON COLUMN "DiscordCounselor".servers.message_great IS 'Nội dung/embed tin nhắn chào mừng';
COMMENT ON COLUMN "DiscordCounselor".servers.message_leave IS 'Nội dung/embed tin nhắn tạm biệt';
COMMENT ON COLUMN "DiscordCounselor".servers.message_boost IS 'Nội dung/embed thông báo nâng cấp';

-- -----------------------------------------------------------------------------
-- Users — Thông tin user (global)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".users (
    user_id     TEXT PRIMARY KEY,
    user_exp    BIGINT NOT NULL DEFAULT 0,
    user_level  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "DiscordCounselor".users IS 'Thông tin user; user_exp/user_level đối chiếu bảng levels';

-- -----------------------------------------------------------------------------
-- Members — Thông tin member trong từng server (server_id + user_idu -> user_id)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".members (
    server_id      TEXT NOT NULL REFERENCES "DiscordCounselor".servers(server_id) ON DELETE CASCADE,
    user_id        TEXT NOT NULL REFERENCES "DiscordCounselor".users(user_id) ON DELETE CASCADE,
    member_exp     BIGINT NOT NULL DEFAULT 0,
    member_level   INTEGER NOT NULL DEFAULT 0,
    member_status  "DiscordCounselor".member_status_enum NOT NULL DEFAULT 'Good',
    member_expires TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (server_id, user_id)
);

COMMENT ON TABLE "DiscordCounselor".members IS 'Thông tin member trong server; user_id tương ứng user_idu (FK users.user_id)';
COMMENT ON COLUMN "DiscordCounselor".members.member_exp IS 'Điểm cục bộ, tăng khi tương tác trong server';
COMMENT ON COLUMN "DiscordCounselor".members.member_level IS 'Level cục bộ (độc lập với user_level)';
COMMENT ON COLUMN "DiscordCounselor".members.member_status IS 'Trạng thái: Good, Warn, Mute, Lock, Kick, leaved';
COMMENT ON COLUMN "DiscordCounselor".members.member_expires IS 'Thời gian kết thúc trạng thái (Warn/Mute/Lock)';

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_members_server ON "DiscordCounselor".members(server_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON "DiscordCounselor".members(user_id);
CREATE INDEX IF NOT EXISTS idx_levels_level ON "DiscordCounselor".levels(level);
CREATE INDEX IF NOT EXISTS idx_functions_script ON "DiscordCounselor".functions(script);
CREATE INDEX IF NOT EXISTS idx_functions_slash ON "DiscordCounselor".functions(slash) WHERE slash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_functions_action ON "DiscordCounselor".functions(action) WHERE action IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_functions_event ON "DiscordCounselor".functions(event) WHERE event IS NOT NULL;
