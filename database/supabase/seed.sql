-- =============================================================================
-- Seed Supabase — Levels (0..999) + Functions (script + embed JSONB)
-- Chạy sau schema.sql.
-- embed: { "replyType": "embed"|"ephemeral", "builder"?: string, "content"?: string }
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Levels: 1000 levels từ 0 đến 999
-- Quy ước: exp[0]=0; exp[i]=exp[i-1]+(A*i) với A=100
-- => exp[i] = 100 * i*(i+1)/2 (i>=1), exp[0]=0
-- -----------------------------------------------------------------------------
INSERT INTO "DiscordCounselor".levels (level_id, level, exp)
SELECT "DiscordCounselor".uuidv7(), s.i, CASE WHEN s.i = 0 THEN 0 ELSE 100 * s.i * (s.i + 1) / 2 END
FROM generate_series(0, 999) AS s(i)
ON CONFLICT (level) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Functions: script, slash, action, event, embed (JSONB)
-- replyType "embed" => code gọi builder; "ephemeral" => content thay {Placeholder} rồi reply
-- -----------------------------------------------------------------------------
INSERT INTO "DiscordCounselor".functions (script_id, script, slash, action, event, embed) VALUES
("DiscordCounselor".uuidv7(), 'ServerInfo', '/server_info', NULL, NULL, '{"replyType":"embed","builder":"serverInfoEmbed.buildEmbed"}'::jsonb),
("DiscordCounselor".uuidv7(), 'StatusTimeout', '/status_timeout', 'Status Timeout', NULL, '{"replyType":"ephemeral","content":"Updated Status Timeout: - Warn: {time_warn} - Mute: {time_mute} - Lock: {time_lock} - Newbie: {time_new}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'StatusRole', '/status_role', 'Status Role', NULL, '{"replyType":"ephemeral","content":"Updated Status Role: - Warn: {role_warn} - Mute: {role_mute} - Lock: {role_lock} - Newbie: {role_new}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'StatusUnrole', '/status_unrole', 'Status Unrole', NULL, '{"replyType":"ephemeral","content":"Updated Status Unrole: - Mute: {unrole_mute} - Lock: {unrole_lock}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'CategoryInfo', '/category_info', NULL, NULL, '{"replyType":"embed","builder":"categoryInfoEmbed.buildCategoryEmbed"}'::jsonb),
("DiscordCounselor".uuidv7(), 'CategoryClone', '/category_clone', 'Clone', NULL, '{"replyType":"ephemeral","content":"Completed Clone {Category Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'CategoryPrivate', '/category_private', 'Private', NULL, '{"replyType":"ephemeral","content":"Privated {Category Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'CategoryPublic', '/category_public', 'Public', NULL, '{"replyType":"ephemeral","content":"Published {Category Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'ChanelInfo', '/channel_info', NULL, NULL, '{"replyType":"embed","builder":"channelInfoEmbed.buildChannelEmbed"}'::jsonb),
("DiscordCounselor".uuidv7(), 'ChannelClone', '/channel_clone', 'Clone', NULL, '{"replyType":"ephemeral","content":"Completed Clone {Channel Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'ChannelSync', '/channel_sync', 'Sync', NULL, '{"replyType":"ephemeral","content":"Completed Sync {Channel Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'ChannelPrivate', '/channel_private', 'Private', NULL, '{"replyType":"ephemeral","content":"Privated {Channel Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'ChannelPublic', '/channel_public', 'Public', NULL, '{"replyType":"ephemeral","content":"Published {Channel Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'ChannelSFW', '/channel_sfw', 'SFW', NULL, '{"replyType":"ephemeral","content":"Changed channel {Channel Name} to SFW."}'::jsonb),
("DiscordCounselor".uuidv7(), 'ChannelNSFW', '/channel_nsfw', 'NSFW', NULL, '{"replyType":"ephemeral","content":"Changed channel {Channel Name} to NSFW."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberInfo', '/member_info', NULL, NULL, '{"replyType":"embed","builder":"memberInfoEmbed.buildEmbed"}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberRename', '/member_rename', 'Name', NULL, '{"replyType":"ephemeral","content":"Completed Rename {Username} to {Server Profile Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberSetlevel', '/member_level', 'Level', NULL, '{"replyType":"ephemeral","content":"Completed Set Level {Server Profile Name}: {member_level}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberMove', '/member_move', 'Move', NULL, '{"replyType":"ephemeral","content":"Moved {Number of Member} to {Channel Name}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberReset', '/member_reset', 'Good - Unwarn - Unmute - Unlock', NULL, '{"replyType":"ephemeral","content":"{Server Profile Name}''s Status is Good now."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberWarn', '/member_warn', 'Warn', NULL, '{"replyType":"ephemeral","content":"{Server Profile Name}''s Status is Warning until {Member Expires}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberMute', '/member_mute', 'Mute', NULL, '{"replyType":"ephemeral","content":"{Server Profile Name}''s Status is Muted until {Member Expires}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberLock', '/member_lock', 'Lock', NULL, '{"replyType":"ephemeral","content":"{Server Profile Name}''s Status is Locked until {Member Expires}."}'::jsonb),
("DiscordCounselor".uuidv7(), 'MemberKick', '/member_kick', 'Kick', NULL, '{"replyType":"ephemeral","content":"{Server Profile Name} has been Kicked."}'::jsonb)
ON CONFLICT (script) DO UPDATE SET
    slash = EXCLUDED.slash,
    action = EXCLUDED.action,
    event = EXCLUDED.event,
    embed = EXCLUDED.embed;
