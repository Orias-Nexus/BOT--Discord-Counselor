# Discord Counselor System

Hệ thống Discord Counselor với kiến trúc Enterprise-ready:

- **Bot (Directive):** Xử lý lệnh Discord, kết nối với Backend API.
- **Backend API:** Express.js, thao tác cơ sở dữ liệu qua Prisma ORM, cung cấp tính năng Real-time qua Socket.io và xử lý nền qua BullMQ.
- **Frontend Dashboard:** Giao diện Web.

## 1. Công nghệ sử dụng

- **Database:** PostgreSQL (trên Supabase), tương tác bằng **Prisma ORM**.
- **Caching & Queue:** Redis + BullMQ (quản lý công việc ngầm và giảm tải Rate Limit Discord API).
- **Real-time:** Socket.io truyền tải cập nhật trạng thái lập tức về giao diện trực tuyến.
- **Logging:** Winston + Daily Rotate File (lưu log tập trung).
- **Authentication:** Discord OAuth2 + JWT (Đăng nhập bảo mật cho web dashboard).

## 2. Cấu trúc thư mục

```
/JS--Discord-Counselor
├── backend/          # API Server (Express, Prisma, Socket.io, BullMQ, Winston)
├── directive/        # Bot Client (Discord.js, BullMQ Worker, Winston)
├── frontend/         # Web Dashboard (Tương lai)
├── docs/             # Tài liệu dự án
├── docker-compose.yml # Chạy toàn bộ stack (Redis, Backend, Directive) cục bộ
└── README.md
```

## 3. Biến môi trường (Environment Variables)

Hệ thống yêu cầu các biến môi trường sau để có thể hoạt động.

Copy và đổi tên `.env.example` trong `/backend`, `/directive`, `/frontend` thành `.env`. Sau đó điền các trường thông tin còn thiếu.

## 4. Hướng dẫn chạy cục bộ toàn bộ hệ thống:

```bash
docker compose up redis -d    # Khởi động Redis bằng Docker

npm run install:all           # Lần đầu: cài dependency cho directive, backend, frontend

# npx prisma db pull:backend  # Kéo schema từ database nếu chưa có schema.prisma
npx prisma generate:backend   # Tạo schema client trên server
# npx prisma db push:backend  # Đẩy schema lên database nếu database chưa có schema
npm run dev:backend           # Chạy process backend server

npm run deploy:directive      # Đăng ký Slash Commands lên Discord
npm run dev:directive         # Chạy process lắng nghe Discord

npm run dev:frontend          # Chạy Vite dev server port 3000
```

## 4. Hoặc chạy thủ công theo thứ tự các bước bên dưới:

### Bước 1: Khởi động Redis bằng Docker

Hệ thống sẽ lỗi nếu thiếu Redis chạy ngầm:

```bash
docker compose up redis -d    # Khởi động Redis bằng Docker 
```

### Bước 2: Chạy Backend API (Port 4000)

Mở một terminal chuyên biệt và chạy:

```bash
cd backend                    # Di chuyển vào backend
npm install                   # Cài đặt dependencies
# npx prisma db pull          # Kéo schema từ database nếu chưa có schema.prisma
npx prisma generate           # Tạo schema client trên server
# npx prisma db push          # Đẩy schema lên database nếu database chưa có schema
npm run dev                   # Chạy process backend server

```

### Bước 3: Chạy Bot Directive

Mở một terminal chuyên biệt và chạy:

```bash
cd directive                  # Di chuyển vào directive
npm install                   # Cài đặt dependencies
npm run deploy                # Đăng ký Slash Commands lên Discord
npm run dev                   # Chạy process lắng nghe Discord
```

### Bước 4: Chạy Frontend Dashboard

Mở một terminal chuyên biệt và chạy:

```bash
cd frontend                   # Di chuyển vào frontend
npm install                   # Cài đặt dependencies
npm run dev                   # Chạy Vite dev server port 3000
```

## 5. Hướng dẫn Deploy bằng Docker Compose (VPS / Server)

Hình thức tự động khởi chạy Production môi trường Staging/Production lên các máy ảo cá nhân (VPS AWS, DO, Linode...).

1. Chỉnh sửa cấu hình `.env` cho `backend` và `directive`. Lưu ý dùng URL nội bộ của Docker thay vì `localhost`:
   - `backend/.env`: Cấu hình `REDIS_URL=redis://redis:6379`
   - `directive/.env`: Cấu hình `REDIS_URL=redis://redis:6379` và `BACKEND_API_URL=http://backend:4000/api`
2. Tại root thư mục, build và khởi chạy hệ thống:

```bash
docker compose build
docker compose up -d
```

Xem log của toàn bộ cụm: `docker compose logs -f`

## 6. Hướng dẫn Deploy lên Nền tảng Cloud (Render, Railway...)

Khuyến khích tách rời 3 thành phần Database, Redis và App Source code.

**A. Cơ sở dữ liệu Postgres & Redis**

- **Supabase**: Lấy thông tin `POOLER_URL` (cho API Server) và `DIRECT_URL` (cho Prisma migrations) gắn vào Backend.
- **Upstash**: Thiết lập database Redis miễn phí và sao chép chuỗi TLS `REDIS_URL` (ví dụ `rediss://...`) cấp cho cả Backend và Directive.

**B. Môi trường Backend (Web Service trên Render)**

1. Chọn Repository. Tạo Node **Web Service** với `Root Directory` là `backend/`.
2. **Build Command**: `npm install && npx prisma generate`
3. **Start Command**: `node src/index.js`
4. Cấp phát toàn bộ `Environment Variables` cần thiết cho Backend như đã mô tả ở trên.

**C. Môi trường Directive (Background Worker trên Render)**

1. Chọn Repository. Tạo Node **Background Worker** (không cần host port) với `Root Directory` là `directive/`.
2. **Build Command**: `npm install`
3. **Start Command**: `node src/index.js`
4. Khai báo `Environment Variables` (*Lưu ý: Chỉ định `BACKEND_API_URL` bằng URL của Web Service Node Backend bạn vừa tạo ở bước B.*). Điền `REDIS_URL` bằng URL của Redis.

## 7. Tài liệu nội bộ

- [Kiến trúc &amp; cài đặt](docs/README.md)

## 8. Trình độ yêu cầu

- Môi trường chạy ít nhất Node.js >= 18
- Máy cài đặt sẵn Docker & Docker Compose (nếu sử dụng docker-compose)
