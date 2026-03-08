-- DROP SCHEMA xoá toàn bộ schema, CASCADE xoá cả bảng có FK tham chiếu.
DROP SCHEMA IF EXISTS "DiscordCounselor" CASCADE;


-- TRUNCATE xoá mọi row, giữ nguyên bảng và constraint. CASCADE truncate cả bảng có FK tham chiếu.
TRUNCATE TABLE "DiscordCounselor".functions, "DiscordCounselor".levels, "DiscordCounselor".servers, "DiscordCounselor".users CASCADE;