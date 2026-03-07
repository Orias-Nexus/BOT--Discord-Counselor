-- =============================================================================
-- Reset: Xoá toàn bộ dữ liệu trong schema DiscordCounselor, giữ nguyên cấu trúc
-- Chạy trong Supabase SQL Editor. Sau khi chạy có thể chạy seed.sql để nạp lại dữ liệu.
-- =============================================================================

-- TRUNCATE xoá mọi row, giữ nguyên bảng và constraint. CASCADE truncate cả bảng có FK tham chiếu.
TRUNCATE TABLE "DiscordCounselor".functions, "DiscordCounselor".levels, "DiscordCounselor".servers, "DiscordCounselor".users CASCADE;
