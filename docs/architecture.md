# Kiến trúc Hệ thống (Architecture)

Tài liệu này giải thích bức tranh toàn cảnh về mặt kỹ thuật của Discord Counselor.

## Sơ đồ Khối (Mô hình Tổng quan)

```text
+----------------+      Socket.io      +--------------------+
|                | <-----------------> |                    |
| Front-End (Web)|                     |    Backend API     | <----+
| React/Vite     | -------- REST ----> |  (Express + Node)  |      | Prisma ORM
+----------------+                     +--------------------+      |
                                        |          |               |
                                     BullMQ     BullMQ         +--------+
                                        |          |           | Postgres|
+----------------+                      v          v           | Database|
|     Discord    | <--- Discord.js --> +--------------------+  +--------+
|   Discord User |                     |  Bot & Worker      |      | Prisma ORM
+----------------+                     |  (Directive Node)  | <----+
                                       +--------------------+
```

## Các Thành phần cốt lõi

### 1. Backend API (Express)
Đóng vai trò là trung tâm kiểm soát dữ liệu:
- Cung cấp RESTful API cho giao diện Frontend.
- Chứa logic xác thực (Discord OAuth2, JWT).
- Hoạt động như một Web-Server và Socket.io server đẩy thông tin (Real-time events) về trực tiếp cho quản trị viên đang theo dõi ứng dụng web.
- Push công việc (Job) sang Redis thông qua BullMQ để hệ thống Bot Directive tiếp nhận và xử lý.

### 2. Bot & Worker (Directive)
- Kết nối thông qua thư viện `discord.js` để có thể phản hồi các sự kiện Slash Command, Interaction trực tiếp với User trên Discord Server.
- Cùng chia sẻ kết nối `Prisma` lên Database để thực thi các query lớn hoặc truy xuất cấp tốc mà không cần qua Backend API nếu không có yêu cầu Real-time.
- Chạy như một Node Worker cho BullMQ Queue (nhận việc từ Redis) - cách tiếp cận này đóng vai trò quan trọng trong việc xử lý khối lượng lớn tin nhắn/tác vụ mà tránh Rate Limits từ API của Discord. 

### 3. Queue Server (Redis / BullMQ)
Đóng vai trò điều hướng tải (Load Balancer & Queue Management):
- BullMQ lưu những nhiệm vụ cần thực thi trong hệ thống (gửi tin nhắn, tạo kênh, cảnh báo) vào Redis dưới dạng Queue.
- Directive Bot kéo chúng ra và xử lý dần. Khi xử lý lỗi, dễ dàng cấu hình Retry, hay Delay chạy sau một khoảng thời gian.

### 4. Database (PostgreSQL & Prisma)
- Sử dụng Database Postgres mạnh mẽ thường được lưu trữ tại `Supabase`.
- Dùng `Prisma ORM` đồng bộ Schema ở mọi ứng dụng Backend/Directive, giữ chuẩn Format chung của dữ liệu tránh sai sót.

## Logging

Các thành phần Server như Backend và Directive đều sử dụng `winston` kết hợp `winston-daily-rotate-file`:
- Cho biết Server có duy trì hoạt động tốt hay đã ngưng.
- Tự động nén và đóng gói File Log cũ để tiết kiệm tệp nháp.
