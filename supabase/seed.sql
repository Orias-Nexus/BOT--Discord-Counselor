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

-- -----------------------------------------------------------------------------
-- Functions: script, slash, action, event (embed hardcode trong code)
-- -----------------------------------------------------------------------------
INSERT INTO "DiscordCounselor".functions (script_id, script, slash, action, event) VALUES
("DiscordCounselor".uuidv7(), 'ServerInfo', '/serverinfo', NULL, NULL),
("DiscordCounselor".uuidv7(), 'StatusTimeout', '/statustimeout', 'Status Timeout', NULL),
("DiscordCounselor".uuidv7(), 'StatusRole', '/statusrole', 'Status Role', NULL),
("DiscordCounselor".uuidv7(), 'StatusUnrole', '/statusunrole', 'Status Unrole', NULL),
("DiscordCounselor".uuidv7(), 'SetVoiceCreator', '/setvoicecreator', 'Voice Creator', NULL),
("DiscordCounselor".uuidv7(), 'SetServerStats', '/setserverstats', 'Server Stats', NULL),
("DiscordCounselor".uuidv7(), 'CategoryInfo', '/categoryinfo', NULL, NULL),
("DiscordCounselor".uuidv7(), 'CategoryClone', '/categoryclone', 'Clone', NULL),
("DiscordCounselor".uuidv7(), 'CategoryPrivate', '/categoryprivate', 'Private', NULL),
("DiscordCounselor".uuidv7(), 'CategoryPublic', '/categorypublic', 'Public', NULL),
("DiscordCounselor".uuidv7(), 'ChannelInfo', '/channelinfo', NULL, NULL),
("DiscordCounselor".uuidv7(), 'ChannelClone', '/channelclone', 'Clone', NULL),
("DiscordCounselor".uuidv7(), 'ChannelCreate', NULL, NULL, 'VoiceStateUpdate'),
("DiscordCounselor".uuidv7(), 'ChannelSync', '/channelsync', 'Sync', NULL),
("DiscordCounselor".uuidv7(), 'ChannelPrivate', '/channelprivate', 'Private', NULL),
("DiscordCounselor".uuidv7(), 'ChannelPublic', '/channelpublic', 'Public', NULL),
("DiscordCounselor".uuidv7(), 'ChannelSFW', '/channelsfw', 'SFW', NULL),
("DiscordCounselor".uuidv7(), 'ChannelNSFW', '/channelnsfw', 'NSFW', NULL),
("DiscordCounselor".uuidv7(), 'MemberInfo', '/memberinfo', NULL, NULL),
("DiscordCounselor".uuidv7(), 'MemberRename', '/memberrename', 'Name', NULL),
("DiscordCounselor".uuidv7(), 'MemberSetlevel', '/memberlevel', 'Level', NULL),
("DiscordCounselor".uuidv7(), 'MemberMove', '/membermove', 'Move', NULL),
("DiscordCounselor".uuidv7(), 'MemberReset', '/memberreset', 'Good', NULL),
("DiscordCounselor".uuidv7(), 'MemberWarn', '/memberwarn', 'Warn', NULL),
("DiscordCounselor".uuidv7(), 'MemberMute', '/membermute', 'Mute', NULL),
("DiscordCounselor".uuidv7(), 'MemberLock', '/memberlock', 'Lock', NULL),
("DiscordCounselor".uuidv7(), 'MemberKick', '/memberkick', 'Kick', NULL),
("DiscordCounselor".uuidv7(), 'LevelLocal', '/levellocal', NULL, NULL),
("DiscordCounselor".uuidv7(), 'LevelGlobal', '/levelglobal', NULL, NULL),
("DiscordCounselor".uuidv7(), 'TopLocal', '/toplocal', NULL, NULL),
("DiscordCounselor".uuidv7(), 'TopGlobal', '/topglobal', NULL, NULL)
ON CONFLICT (script) DO UPDATE SET
  slash = EXCLUDED.slash,
  action = EXCLUDED.action,
  event = EXCLUDED.event;
