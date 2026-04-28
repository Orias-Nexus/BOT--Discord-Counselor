CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SCHEMA IF NOT EXISTS "DiscordCounselor";

-- -----------------------------------------------------------------------------
-- ENUM: Member Status (ARCHITECTURES.json Database.Enum)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE "DiscordCounselor".member_status_enum AS ENUM (
        'Newbie',
        'Good',
        'Warn',
        'Mute',
        'Lock',
        'Kick',
        'Leaved'
    );

EXCEPTION WHEN duplicate_object THEN NULL;

END $$;

COMMENT ON TYPE "DiscordCounselor".member_status_enum IS 'Trạng thái thành viên trong server';

-- -----------------------------------------------------------------------------
-- ENUM: Category Type (Creator = danh mục Voice Creator; Stats = danh mục Server Stats)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE "DiscordCounselor".category_type_enum AS ENUM ('Creator', 'Stats');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE "DiscordCounselor".category_type_enum IS 'Creator: danh mục chứa kênh trigger Voice Creator. Stats: danh mục chứa các kênh stat.';

-- -----------------------------------------------------------------------------
-- ENUM: Server Status (Standard, Premium, Deluxe, Leaved)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE "DiscordCounselor".server_status_enum AS ENUM (
        'Standard',
        'Premium',
        'Deluxe',
        'Leaved'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE "DiscordCounselor".server_status_enum IS 'Trạng thái server: Standard (mặc định), Premium, Deluxe, Leaved (bot đã rời)';

-- -----------------------------------------------------------------------------
-- ENUM: Message Type (Messages, Greeting, Leaving, Boosting, Leveling, Logging)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE "DiscordCounselor".message_type_enum AS ENUM (
        'Messages',
        'Greeting',
        'Leaving',
        'Boosting',
        'Leveling',
        'Logging'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE "DiscordCounselor".message_type_enum IS 'Loại tin nhắn cấu hình: Messages, Greeting, Leaving, Boosting, Leveling, Logging';