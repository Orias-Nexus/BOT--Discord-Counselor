# Discord Counselor — Roadmap

> Quy trình xây dựng hệ thống từ nền tảng đến triển khai.

---

## 1. Architecture

- [x] Thiết kế kiến trúc Monorepo: `backend/`, `directive/`, `frontend/`, `shared/`.
- [x] Xác định công nghệ chính: Node.js, Discord.js v14, Express, Prisma ORM, React + Vite.
- [x] Thiết kế hệ thống biến động (Variables Engine) với 4 phase xử lý: Guards → Modifiers → Actions → Placeholders.
- [x] Thiết kế hệ thống Script Registry (`runScript.js`) để ánh xạ tên script → module tự động.
- [x] Thiết kế Event Registry (`eventRegistry.js`) để ánh xạ Discord Events → Scripts.

## 2. Infrastructure

- [x] Cấu hình `docker-compose.yml` với 4 services: `redis`, `backend`, `frontend`, `directive`.
- [x] Cấu hình Redis Alpine cho Caching & Message Queue (port 6379).
- [x] Cấu hình Nginx reverse proxy cho Frontend (port 3000 → 80).
- [x] Thiết lập `render.yaml` cho Render.com deployment.
- [x] Cấu hình `.gitignore`, `.dockerignore` cho từng service.

## 3. Database

- [x] Khởi tạo PostgreSQL trên Supabase (hosted).
- [x] Thiết kế schema: `servers`, `members`, `users`, `channels`, `embeds`, `messages`, `functions`, `levels`.
- [x] Thiết lập Prisma ORM với `schema.prisma` (introspect từ Supabase).
- [x] Cấu hình Row Level Security (RLS) cho các bảng nhạy cảm.
- [x] Tạo Enum types: `category_type_enum`, `member_status_enum`, `message_type_enum`.
- [x] Migrate toàn bộ repository từ Supabase JS Client sang Prisma Client.

## 4. Backend API

- [x] Khởi tạo Express Server (port 4000) với cấu trúc MVC: Controllers → Services → Repositories.
- [x] Tạo API Routes: `serverRoutes`, `memberRoutes`, `channelRoutes`, `embedRoutes`, `messageRoutes`, `functionRoutes`, `levelRoutes`, `authRoutes`.
- [x] Tích hợp Winston Logger (ghi log xoay vòng theo ngày, lưu tập trung `private/logs/`).
- [x] Tích hợp Redis (ioredis) + BullMQ Queue cho task bất đồng bộ.
- [x] Tích hợp Socket.io Server cho giao tiếp thời gian thực.
- [x] Tích hợp Discord OAuth2 + JWT Authentication.
- [x] Xoá hoàn toàn dependency `@supabase/supabase-js` khỏi backend.

## 5. Directive (Discord Bot)

- [x] Khởi tạo Discord.js v14 Client với Intents đầy đủ.
- [x] Xây dựng Variables Engine: resolve Guards, Modifiers, Actions, Placeholders theo thứ tự phase.
- [x] Thi công 46 scripts (Server, Category, Channel, Member, Embed, Greeting/Leaving/Boosting).
- [x] Đăng ký 4 Events: `GuildMemberAdd`, `GuildMemberRemove`, `GuildMemberUpdate`, `VoiceStateUpdate`.
- [x] Tích hợp BullMQ Worker để nhận task từ Backend Queue.
- [x] Tích hợp Winston Logger cho Bot.
- [x] Refactor toàn bộ API Fetcher (`api.js`) dùng `fetch` gọi Backend thay vì Supabase.

## 6. Frontend Dashboard

- [x] Khởi tạo Vite + React 18 project.
- [x] Tích hợp TailwindCSS v4 với `@tailwindcss/vite` plugin.
- [x] Xây dựng DashboardLayout (Sidebar + Header + Outlet).
- [x] Xây dựng AuthContext (JWT) + SocketContext (Socket.io-client).
- [x] Thi công các trang: Login, Overview (Server Picker), Members, Messages, Settings.
- [x] Cấu hình Axios interceptor tự đính JWT vào mọi request.
- [ ] Kết nối API thực tế (fetch data từ Backend endpoints).
- [ ] Xây dựng các form chỉnh sửa dữ liệu (Embed Editor, Role Picker, v.v.).
- [ ] Thiết kế Responsive cho mobile/tablet.

## 7. Deployment

- [ ] Build production bundle cho Backend (`npm run build`).
- [ ] Build production bundle cho Frontend (`vite build`).
- [ ] Kiểm tra Docker Compose hoạt động end-to-end trên máy local.
- [ ] Deploy lên Render.com hoặc VPS (theo `render.yaml`).
- [ ] Kiểm tra SSL, domain, và monitoring sau khi deploy.
