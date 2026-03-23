-- =============================================================================
-- Schema Supabase — Theo Architecture.json (schema "DiscordCounselor")
-- Chạy trong Supabase SQL Editor hoặc migration.
-- Thứ tự: functions.sql → schema.sql → triggers.sql
-- =============================================================================

DROP SCHEMA IF EXISTS "DiscordCounselor" CASCADE;

-- -----------------------------------------------------------------------------
-- Levels — Định nghĩa các mốc điểm yêu cầu cho các level
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".levels (
    level_id   UUID PRIMARY KEY DEFAULT "DiscordCounselor".uuidv7(),
    level      INTEGER NOT NULL UNIQUE,
    exp        BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status         "DiscordCounselor".server_status_enum NOT NULL DEFAULT 'Standard'
);

-- Nếu bảng đã tồn tại từ trước, đảm bảo có cột status và xóa cột cũ.
ALTER TABLE IF EXISTS "DiscordCounselor".servers
    ADD COLUMN IF NOT EXISTS status "DiscordCounselor".server_status_enum NOT NULL DEFAULT 'Standard';
ALTER TABLE IF EXISTS "DiscordCounselor".servers
    DROP COLUMN IF EXISTS level_channel,
    DROP COLUMN IF EXISTS logs_channel;

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
COMMENT ON COLUMN "DiscordCounselor".servers.status IS 'Trạng thái server: Standard (mặc định), Premium, Deluxe, Leaved';

-- -----------------------------------------------------------------------------
-- Embeds — Chỉ embed do người dùng tạo (messages, v.v.). Embed của lệnh hardcode trong code.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".embeds (
    embed_id    UUID PRIMARY KEY DEFAULT "DiscordCounselor".uuidv7(),
    embed_name  TEXT NOT NULL,
    server_id   TEXT NOT NULL REFERENCES "DiscordCounselor".servers(server_id) ON DELETE CASCADE,
    embed       JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (embed_name, server_id)
);

COMMENT ON TABLE "DiscordCounselor".embeds IS 'Chỉ embed do người dùng tạo; embed của lệnh hardcode trong code';
COMMENT ON COLUMN "DiscordCounselor".embeds.embed_name IS 'Tên embed do người dùng đặt';
COMMENT ON COLUMN "DiscordCounselor".embeds.server_id IS 'Server sở hữu embed';

-- -----------------------------------------------------------------------------
-- Messages — Cấu hình tin nhắn theo loại (Greeting, Leaving, Boosting, Logging...)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".messages (
    messages_id   UUID PRIMARY KEY DEFAULT "DiscordCounselor".uuidv7(),
    messages_type "DiscordCounselor".message_type_enum NOT NULL,
    server_id     TEXT NOT NULL REFERENCES "DiscordCounselor".servers(server_id) ON DELETE CASCADE,
    channel_id    TEXT,
    embed_id      UUID REFERENCES "DiscordCounselor".embeds(embed_id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "DiscordCounselor".messages IS 'Cấu hình tin nhắn theo loại; channel_id NULL = chưa cấu hình';
COMMENT ON COLUMN "DiscordCounselor".messages.messages_type IS 'Loại: Messages, Greeting, Leaving, Boosting, Logging';
COMMENT ON COLUMN "DiscordCounselor".messages.channel_id IS 'Kênh gửi tin; NULL = chưa cấu hình';
COMMENT ON COLUMN "DiscordCounselor".messages.embed_id IS 'Tham chiếu embeds (nullable)';

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
COMMENT ON COLUMN "DiscordCounselor".members.member_status IS 'Trạng thái: Good, Warn, Mute, Lock, Kick, Leaved';
COMMENT ON COLUMN "DiscordCounselor".members.member_expires IS 'Thời gian kết thúc trạng thái (Warn/Mute/Lock)';

-- -----------------------------------------------------------------------------
-- Channels — Danh mục quản trị (Creator / Stats). Chỉ lưu category_id và channels_idx.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "DiscordCounselor".channels (
    category_id   TEXT PRIMARY KEY,
    category_type "DiscordCounselor".category_type_enum NOT NULL,
    server_id     TEXT NOT NULL REFERENCES "DiscordCounselor".servers(server_id) ON DELETE CASCADE,
    channels_idx  INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE "DiscordCounselor".channels IS 'Danh mục quản trị: Creator (1 kênh trigger) hoặc Stats (n kênh theo channels_idx).';
COMMENT ON COLUMN "DiscordCounselor".channels.category_id IS 'ID danh mục Discord';
COMMENT ON COLUMN "DiscordCounselor".channels.category_type IS 'Creator | Stats';
COMMENT ON COLUMN "DiscordCounselor".channels.server_id IS 'ID server (guild)';
COMMENT ON COLUMN "DiscordCounselor".channels.channels_idx IS '0 = Creator. Stats: chữ số trái→phải = index stat (1–6) theo thứ tự kênh. VD: 312 = Role, Member, Bot.';

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_members_server ON "DiscordCounselor".members(server_id);
CREATE INDEX IF NOT EXISTS idx_channels_server ON "DiscordCounselor".channels(server_id);
CREATE INDEX IF NOT EXISTS idx_channels_category_type ON "DiscordCounselor".channels(category_type);
CREATE INDEX IF NOT EXISTS idx_members_user ON "DiscordCounselor".members(user_id);
CREATE INDEX IF NOT EXISTS idx_levels_level ON "DiscordCounselor".levels(level);
CREATE INDEX IF NOT EXISTS idx_embeds_server ON "DiscordCounselor".embeds(server_id);
CREATE INDEX IF NOT EXISTS idx_embeds_name_server ON "DiscordCounselor".embeds(embed_name, server_id);
