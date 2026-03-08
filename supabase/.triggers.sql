-- =============================================================================
-- Triggers — Schema "DiscordCounselor"
-- Chạy sau schema.sql và functions.sql (trigger dùng function đã định nghĩa).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Servers: sau INSERT tự tạo 3 embeds (template) rồi 3 messages (embed_id = 3 embeds vừa tạo)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_server_insert_messages ON "DiscordCounselor".servers;
CREATE TRIGGER trg_server_insert_embeds_and_messages
  AFTER INSERT ON "DiscordCounselor".servers
  FOR EACH ROW
  EXECUTE FUNCTION "DiscordCounselor".on_server_insert_create_embeds_and_messages();
