-- =============================================================================
-- Functions — Schema "DiscordCounselor"
-- Chạy trước schema.sql (các bảng dùng uuidv7() trong DEFAULT).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- UUID v7 — Time-ordered UUID (sắp xếp theo thời gian tạo)
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
-- Trigger function: tạo 5 embeds (template từ zTemplate.js) rồi 5 messages với embed_id
-- Thứ tự: embeds trước, messages sau (messages.embed_id = embeds vừa tạo).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "DiscordCounselor".on_server_insert_create_embeds_and_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = "DiscordCounselor"
AS $$
DECLARE
  id_greeting  uuid;
  id_leaving   uuid;
  id_boosting  uuid;
  id_leveling  uuid;
  id_logging   uuid;
  j_greeting  jsonb := '{"title":"**Greeting! {user_name}!**","description":"**Welcome to {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Rule","value":"Just enjoy your time here!","inline":false}],"footer":{"text":"Thank you for joining us!","icon_url":"{server_icon}"}}'::jsonb;
  j_leaving   jsonb := '{"title":"**Goodbye! {user_name}!**","description":"**Goodbye from {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope to see you again!","inline":false}],"footer":{"text":"See you next time!","icon_url":"{server_icon}"}}'::jsonb;
  j_boosting  jsonb := '{"title":"**Thank You! {user_name}!**","description":"**You are now boosting {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope you enjoy your time here!","inline":false}],"footer":{"text":"Thank you for boosting us!","icon_url":"{server_icon}"}}'::jsonb;
  j_leveling  jsonb := '{"title":"**Level Up! {user_name}!**","description":"**Congratulations on leveling up in {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"Keep it up and enjoy your journey!","inline":false}],"footer":{"text":"Great progress!","icon_url":"{server_icon}"}}'::jsonb;
  j_logging   jsonb := '{"title":"**Log — {server_name}**","description":"**An event has been logged.**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":null},"fields":[{"name":"Member","value":"{user_name}","inline":true},{"name":"Action","value":"Logged","inline":true},{"name":"Details","value":"See audit log for more info.","inline":false}],"footer":{"text":"Server Log","icon_url":"{server_icon}"}}'::jsonb;
BEGIN
  INSERT INTO "DiscordCounselor".embeds (embed_name, server_id, embed)
  VALUES ('Greeting', NEW.server_id, j_greeting)
  RETURNING embed_id INTO id_greeting;

  INSERT INTO "DiscordCounselor".embeds (embed_name, server_id, embed)
  VALUES ('Leaving', NEW.server_id, j_leaving)
  RETURNING embed_id INTO id_leaving;

  INSERT INTO "DiscordCounselor".embeds (embed_name, server_id, embed)
  VALUES ('Boosting', NEW.server_id, j_boosting)
  RETURNING embed_id INTO id_boosting;

  INSERT INTO "DiscordCounselor".embeds (embed_name, server_id, embed)
  VALUES ('Leveling', NEW.server_id, j_leveling)
  RETURNING embed_id INTO id_leveling;

  INSERT INTO "DiscordCounselor".embeds (embed_name, server_id, embed)
  VALUES ('Logging', NEW.server_id, j_logging)
  RETURNING embed_id INTO id_logging;

  INSERT INTO "DiscordCounselor".messages (messages_type, server_id, channel_id, embed_id)
  VALUES
    ('Greeting', NEW.server_id, NULL, id_greeting),
    ('Leaving',  NEW.server_id, NULL, id_leaving),
    ('Boosting', NEW.server_id, NULL, id_boosting),
    ('Leveling', NEW.server_id, NULL, id_leveling),
    ('Logging',  NEW.server_id, NULL, id_logging);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION "DiscordCounselor".on_server_insert_create_embeds_and_messages() IS 'Trigger: sau INSERT servers, tạo 5 embeds (template mặc định) + 5 messages (embed_id trỏ tới 5 embeds).';

-- -----------------------------------------------------------------------------
-- Backfill: đảm bảo server có đủ 5 embeds (template) + 5 messages (embed_id)
-- Dùng cho server cũ chưa có đủ hoặc messages.embed_id null.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "DiscordCounselor".backfill_embeds_and_messages_for_server(p_server_id TEXT)
RETURNS void
LANGUAGE plpgsql
SET search_path = "DiscordCounselor"
AS $$
DECLARE
  id_embed uuid;
  id_message uuid;
  msg_embed_id uuid;
  j_greeting  jsonb := '{"title":"**Greeting! {user_name}!**","description":"**Welcome to {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Rule","value":"Just enjoy your time here!","inline":false}],"footer":{"text":"Thank you for joining us!","icon_url":"{server_icon}"}}'::jsonb;
  j_leaving   jsonb := '{"title":"**Goodbye! {user_name}!**","description":"**Goodbye from {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope to see you again!","inline":false}],"footer":{"text":"See you next time!","icon_url":"{server_icon}"}}'::jsonb;
  j_boosting  jsonb := '{"title":"**Thank You! {user_name}!**","description":"**You are now boosting {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope you enjoy your time here!","inline":false}],"footer":{"text":"Thank you for boosting us!","icon_url":"{server_icon}"}}'::jsonb;
  j_leveling  jsonb := '{"title":"**Level Up! {user_name}!**","description":"**Congratulations on leveling up in {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"Keep it up and enjoy your journey!","inline":false}],"footer":{"text":"Great progress!","icon_url":"{server_icon}"}}'::jsonb;
  j_logging   jsonb := '{"title":"**Log — {server_name}**","description":"**An event has been logged.**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":null},"fields":[{"name":"Member","value":"{user_name}","inline":true},{"name":"Action","value":"Logged","inline":true},{"name":"Details","value":"See audit log for more info.","inline":false}],"footer":{"text":"Server Log","icon_url":"{server_icon}"}}'::jsonb;
BEGIN
  IF p_server_id IS NULL OR p_server_id = '' THEN
    RETURN;
  END IF;

  -- Greeting
  SELECT e.embed_id INTO id_embed FROM embeds e WHERE e.server_id = p_server_id AND e.embed_name = 'Greeting' LIMIT 1;
  IF id_embed IS NULL THEN
    INSERT INTO embeds (embed_name, server_id, embed) VALUES ('Greeting', p_server_id, j_greeting) RETURNING embed_id INTO id_embed;
  END IF;
  SELECT m.messages_id, m.embed_id INTO id_message, msg_embed_id FROM messages m WHERE m.server_id = p_server_id AND m.messages_type = 'Greeting' LIMIT 1;
  IF id_message IS NULL THEN
    INSERT INTO messages (messages_type, server_id, channel_id, embed_id) VALUES ('Greeting', p_server_id, NULL, id_embed);
  ELSIF msg_embed_id IS NULL THEN
    UPDATE messages SET embed_id = id_embed, updated_at = NOW() WHERE messages_id = id_message;
  END IF;

  -- Leaving
  id_embed := NULL;
  SELECT e.embed_id INTO id_embed FROM embeds e WHERE e.server_id = p_server_id AND e.embed_name = 'Leaving' LIMIT 1;
  IF id_embed IS NULL THEN
    INSERT INTO embeds (embed_name, server_id, embed) VALUES ('Leaving', p_server_id, j_leaving) RETURNING embed_id INTO id_embed;
  END IF;
  id_message := NULL; msg_embed_id := NULL;
  SELECT m.messages_id, m.embed_id INTO id_message, msg_embed_id FROM messages m WHERE m.server_id = p_server_id AND m.messages_type = 'Leaving' LIMIT 1;
  IF id_message IS NULL THEN
    INSERT INTO messages (messages_type, server_id, channel_id, embed_id) VALUES ('Leaving', p_server_id, NULL, id_embed);
  ELSIF msg_embed_id IS NULL THEN
    UPDATE messages SET embed_id = id_embed, updated_at = NOW() WHERE messages_id = id_message;
  END IF;

  -- Boosting
  id_embed := NULL;
  SELECT e.embed_id INTO id_embed FROM embeds e WHERE e.server_id = p_server_id AND e.embed_name = 'Boosting' LIMIT 1;
  IF id_embed IS NULL THEN
    INSERT INTO embeds (embed_name, server_id, embed) VALUES ('Boosting', p_server_id, j_boosting) RETURNING embed_id INTO id_embed;
  END IF;
  id_message := NULL; msg_embed_id := NULL;
  SELECT m.messages_id, m.embed_id INTO id_message, msg_embed_id FROM messages m WHERE m.server_id = p_server_id AND m.messages_type = 'Boosting' LIMIT 1;
  IF id_message IS NULL THEN
    INSERT INTO messages (messages_type, server_id, channel_id, embed_id) VALUES ('Boosting', p_server_id, NULL, id_embed);
  ELSIF msg_embed_id IS NULL THEN
    UPDATE messages SET embed_id = id_embed, updated_at = NOW() WHERE messages_id = id_message;
  END IF;

  -- Leveling
  id_embed := NULL;
  SELECT e.embed_id INTO id_embed FROM embeds e WHERE e.server_id = p_server_id AND e.embed_name = 'Leveling' LIMIT 1;
  IF id_embed IS NULL THEN
    INSERT INTO embeds (embed_name, server_id, embed) VALUES ('Leveling', p_server_id, j_leveling) RETURNING embed_id INTO id_embed;
  END IF;
  id_message := NULL; msg_embed_id := NULL;
  SELECT m.messages_id, m.embed_id INTO id_message, msg_embed_id FROM messages m WHERE m.server_id = p_server_id AND m.messages_type = 'Leveling' LIMIT 1;
  IF id_message IS NULL THEN
    INSERT INTO messages (messages_type, server_id, channel_id, embed_id) VALUES ('Leveling', p_server_id, NULL, id_embed);
  ELSIF msg_embed_id IS NULL THEN
    UPDATE messages SET embed_id = id_embed, updated_at = NOW() WHERE messages_id = id_message;
  END IF;

  -- Logging
  id_embed := NULL;
  SELECT e.embed_id INTO id_embed FROM embeds e WHERE e.server_id = p_server_id AND e.embed_name = 'Logging' LIMIT 1;
  IF id_embed IS NULL THEN
    INSERT INTO embeds (embed_name, server_id, embed) VALUES ('Logging', p_server_id, j_logging) RETURNING embed_id INTO id_embed;
  END IF;
  id_message := NULL; msg_embed_id := NULL;
  SELECT m.messages_id, m.embed_id INTO id_message, msg_embed_id FROM messages m WHERE m.server_id = p_server_id AND m.messages_type = 'Logging' LIMIT 1;
  IF id_message IS NULL THEN
    INSERT INTO messages (messages_type, server_id, channel_id, embed_id) VALUES ('Logging', p_server_id, NULL, id_embed);
  ELSIF msg_embed_id IS NULL THEN
    UPDATE messages SET embed_id = id_embed, updated_at = NOW() WHERE messages_id = id_message;
  END IF;
END;
$$;

COMMENT ON FUNCTION "DiscordCounselor".backfill_embeds_and_messages_for_server(TEXT) IS 'Backfill: đảm bảo server có 5 embeds (Greeting, Leaving, Boosting, Leveling, Logging) + 5 messages với embed_id. Gọi cho server cũ.';

-- Chạy backfill cho mọi server (trong SQL Editor hoặc migration):
-- SELECT "DiscordCounselor".backfill_embeds_and_messages_for_server(s.server_id) FROM "DiscordCounselor".servers s;
