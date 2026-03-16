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
-- Trigger function: tạo 3 embeds (template từ zTemplate.js) rồi 3 messages với embed_id
-- Thứ tự: embeds trước, messages sau (messages.embed_id = embeds vừa tạo).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "DiscordCounselor".on_server_insert_create_embeds_and_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = "DiscordCounselor"
AS $$
DECLARE
  id_greeting uuid;
  id_leaving  uuid;
  id_boosting uuid;
  j_greeting jsonb := '{"title":"**Greeting! {user_name}!**","description":"**Welcome to {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Rule","value":"Just enjoy your time here!","inline":false}],"footer":{"text":"Thank you for joining us!","icon_url":"{server_icon}"}}'::jsonb;
  j_leaving  jsonb := '{"title":"**Goodbye! {user_name}!**","description":"**Goodbye from {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope to see you again!","inline":false}],"footer":{"text":"See you next time!","icon_url":"{server_icon}"}}'::jsonb;
  j_boosting jsonb := '{"title":"**Thank You! {user_name}!**","description":"**You are now boosting {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope you enjoy your time here!","inline":false}],"footer":{"text":"Thank you for boosting us!","icon_url":"{server_icon}"}}'::jsonb;
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

  INSERT INTO "DiscordCounselor".messages (messages_type, server_id, channel_id, embed_id)
  VALUES
    ('Greeting', NEW.server_id, NULL, id_greeting),
    ('Leaving',  NEW.server_id, NULL, id_leaving),
    ('Boosting', NEW.server_id, NULL, id_boosting);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION "DiscordCounselor".on_server_insert_create_embeds_and_messages() IS 'Trigger: sau INSERT servers, tạo 3 embeds (template mặc định) + 3 messages (embed_id trỏ tới 3 embeds).';

-- -----------------------------------------------------------------------------
-- Backfill: đảm bảo server có đủ 3 embeds (template) + 3 messages (embed_id)
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
  j_greeting jsonb := '{"title":"**Greeting! {user_name}!**","description":"**Welcome to {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Rule","value":"Just enjoy your time here!","inline":false}],"footer":{"text":"Thank you for joining us!","icon_url":"{server_icon}"}}'::jsonb;
  j_leaving  jsonb := '{"title":"**Goodbye! {user_name}!**","description":"**Goodbye from {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope to see you again!","inline":false}],"footer":{"text":"See you next time!","icon_url":"{server_icon}"}}'::jsonb;
  j_boosting jsonb := '{"title":"**Thank You! {user_name}!**","description":"**You are now boosting {server_name}!**","color":5763719,"timestamp":null,"author":{"name":"✦ {server_name}","icon_url":"{server_icon}"},"thumbnail":{"url":"{user_avatar}"},"image":{"url":"{server_banner}"},"fields":[{"name":"Your Position","value":"{server_membercount}","inline":true},{"name":"Rule Channel","value":"{rule_channel}","inline":true},{"name":"Small Note","value":"We hope you enjoy your time here!","inline":false}],"footer":{"text":"Thank you for boosting us!","icon_url":"{server_icon}"}}'::jsonb;
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
END;
$$;

COMMENT ON FUNCTION "DiscordCounselor".backfill_embeds_and_messages_for_server(TEXT) IS 'Backfill: đảm bảo server có 3 embeds (Greeting, Leaving, Boosting) + 3 messages với embed_id. Gọi cho server cũ.';

-- Chạy backfill cho mọi server (trong SQL Editor hoặc migration):
-- SELECT "DiscordCounselor".backfill_embeds_and_messages_for_server(s.server_id) FROM "DiscordCounselor".servers s;
