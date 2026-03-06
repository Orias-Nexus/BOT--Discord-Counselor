CREATE TYPE status_enum AS ENUM ('Good', 'Warning', 'Muted', 'Locked');

CREATE TABLE IF NOT EXISTS member_profiles (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    status status_enum NOT NULL DEFAULT 'Good',
    status_expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, guild_id)
);

CREATE INDEX IF NOT EXISTS idx_member_profiles_guild ON member_profiles (guild_id);
