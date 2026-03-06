-- Xóa bảng cũ (cẩn thận: mất hết dữ liệu)
DROP TABLE IF EXISTS server_profiles;

-- Tạo lại bảng với đủ cột
CREATE TABLE server_profiles (
  guild_id   TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT 'Server',
  link       TEXT,                       -- link mời
  time_warn  INTEGER NOT NULL DEFAULT 0, -- phút mặc định cho Warn (0 = vô hạn)
  time_mute  INTEGER NOT NULL DEFAULT 0, -- phút mặc định cho Mute (0 = vô hạn)
  time_lock  INTEGER NOT NULL DEFAULT 0  -- phút mặc định cho Lock (0 = vô hạn)
);

-- Tuỳ chọn: comment cho dễ nhớ
COMMENT ON COLUMN server_profiles.time_warn IS 'Số phút mặc định khi áp dụng Warn; 0 = vô hạn';
COMMENT ON COLUMN server_profiles.time_mute IS 'Số phút mặc định khi áp dụng Mute; 0 = vô hạn';
COMMENT ON COLUMN server_profiles.time_lock IS 'Số phút mặc định khi áp dụng Lock; 0 = vô hạn';