-- =============================================================================
-- Policy Supabase — Schema "DiscordCounselor"
-- Chạy trong Supabase SQL Editor.
-- Sau khi chạy: Dashboard → Project Settings → API → Exposed schemas → thêm "DiscordCounselor".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PHẦN 1: Huỷ bỏ toàn bộ policy và revoke quyền
-- -----------------------------------------------------------------------------

-- 1.1 Drop tất cả policy đã tạo (theo tên cũ)
DROP POLICY IF EXISTS "Allow public read access on levels" ON "DiscordCounselor"."levels";
DROP POLICY IF EXISTS "Allow public read access on members" ON "DiscordCounselor"."members";
DROP POLICY IF EXISTS "Allow public read access on servers" ON "DiscordCounselor"."servers";
DROP POLICY IF EXISTS "Allow public read access on users" ON "DiscordCounselor"."users";
DROP POLICY IF EXISTS "Allow public read access on channels" ON "DiscordCounselor"."channels";
DROP POLICY IF EXISTS "Allow public read access on messages" ON "DiscordCounselor"."messages";
DROP POLICY IF EXISTS "Allow public read access on embeds" ON "DiscordCounselor"."embeds";

-- 1.2 Revoke toàn bộ quyền trên schema và các bảng (bắt đầu từ bảng, sau đó schema)
REVOKE ALL ON ALL TABLES IN SCHEMA "DiscordCounselor" FROM anon, authenticated, service_role;
REVOKE ALL ON ALL ROUTINES IN SCHEMA "DiscordCounselor" FROM anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA "DiscordCounselor" FROM anon, authenticated, service_role;
REVOKE USAGE ON SCHEMA "DiscordCounselor" FROM anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- PHẦN 2: Cấp quyền đầy đủ
-- -----------------------------------------------------------------------------

-- 2.1 Schema: cho phép các role nhìn thấy schema
GRANT USAGE ON SCHEMA "DiscordCounselor" TO anon, authenticated, service_role;

-- 2.2 Bảng: cấp đủ quyền SELECT, INSERT, UPDATE, DELETE cho từng bảng (tường minh)
GRANT SELECT, INSERT, UPDATE, DELETE ON "DiscordCounselor"."levels" TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "DiscordCounselor"."servers" TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "DiscordCounselor"."users" TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "DiscordCounselor"."members" TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "DiscordCounselor"."channels" TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "DiscordCounselor"."messages" TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON "DiscordCounselor"."embeds" TO anon, authenticated, service_role;

-- 2.3 Hàm và sequence (bảng mới tạo sau này vẫn cần grant thủ công hoặc chạy lại script)
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA "DiscordCounselor" TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "DiscordCounselor" TO anon, authenticated, service_role;

-- 2.4 Bật RLS cho tất cả bảng
ALTER TABLE "DiscordCounselor"."levels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."servers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."embeds" ENABLE ROW LEVEL SECURITY;

-- 2.5 Tạo policy: anon và authenticated được SELECT toàn bộ (backend dùng service_role, bypass RLS)
CREATE POLICY "dc_levels_select"
  ON "DiscordCounselor"."levels" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dc_servers_select"
  ON "DiscordCounselor"."servers" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dc_users_select"
  ON "DiscordCounselor"."users" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dc_members_select"
  ON "DiscordCounselor"."members" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dc_channels_select"
  ON "DiscordCounselor"."channels" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dc_messages_select"
  ON "DiscordCounselor"."messages" FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "dc_embeds_select"
  ON "DiscordCounselor"."embeds" FOR SELECT TO anon, authenticated USING (true);

-- 2.6 Cho phép service_role đủ thao tác qua RLS (trùng với grant; Supabase service_role thường bypass RLS)
CREATE POLICY "dc_levels_all"
  ON "DiscordCounselor"."levels" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "dc_servers_all"
  ON "DiscordCounselor"."servers" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "dc_users_all"
  ON "DiscordCounselor"."users" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "dc_members_all"
  ON "DiscordCounselor"."members" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "dc_channels_all"
  ON "DiscordCounselor"."channels" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "dc_messages_all"
  ON "DiscordCounselor"."messages" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "dc_embeds_all"
  ON "DiscordCounselor"."embeds" FOR ALL TO service_role USING (true) WITH CHECK (true);
