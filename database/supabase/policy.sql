-- -----------------------------------------------------------------------------
-- Expose schema cho PostgREST (API): grant quyền cho anon, authenticated, service_role
-- Sau khi chạy xong, vào Supabase Dashboard → Project Settings → API → Exposed schemas
-- thêm "DiscordCounselor" vào danh sách (nếu chưa có).
-- -----------------------------------------------------------------------------

-- 1. Bật RLS cho các bảng
ALTER TABLE "DiscordCounselor"."functions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."levels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."servers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiscordCounselor"."users" ENABLE ROW LEVEL SECURITY;

-- 2. Cho phép API nhìn thấy schema này (anon, authenticated, service_role)
GRANT USAGE ON SCHEMA "DiscordCounselor" TO anon, authenticated, service_role;
-- 3. Cấp quyền thao tác trên các bảng
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "DiscordCounselor" TO anon, authenticated, service_role;
-- 4. Cấp quyền chạy hàm
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA "DiscordCounselor" TO anon, authenticated, service_role;
-- 5. Cấp quyền sử dụng sequence
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "DiscordCounselor" TO anon, authenticated, service_role;
-- Cho phép Public Key (anon) ĐỌC bảng functions
CREATE POLICY "Allow public read access on functions" 
ON "DiscordCounselor"."functions" 
FOR SELECT TO anon 
USING (true);

-- Cho phép Public Key (anon) ĐỌC bảng levels
CREATE POLICY "Allow public read access on levels" 
ON "DiscordCounselor"."levels" 
FOR SELECT TO anon 
USING (true);

-- Cho phép Public Key (anon) ĐỌC bảng members
CREATE POLICY "Allow public read access on members" 
ON "DiscordCounselor"."members" 
FOR SELECT TO anon 
USING (true);

-- Cho phép Public Key (anon) ĐỌC bảng servers
CREATE POLICY "Allow public read access on servers" 
ON "DiscordCounselor"."servers" 
FOR SELECT TO anon 
USING (true);

-- Cho phép Public Key (anon) ĐỌC bảng users
CREATE POLICY "Allow public read access on users" 
ON "DiscordCounselor"."users" 
FOR SELECT TO anon 
USING (true);