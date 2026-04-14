# Discord Counselor System

Hệ thống Discord Counselor với kiến trúc Enterprise-ready. Dự án bao gồm một Bot Discord, một API Backend chia sẻ qua REST và Socket.io, cùng một Web Dashboard đang được phát triển.

Đặc điểm Hệ thống & Các Công nghệ Chính

Hệ thống được thiết kế theo kiến trúc Microservices-lite phân tách rõ ràng trách nhiệm để có thể hoạt động bền bỉ, hỗ trợ quản lý công việc ngầm bằng Queue và Real-time cập nhật.

1. **Backend API (Express.js):** Quản lý kết nối cơ sở dữ liệu qua **Prisma ORM** với **PostgreSQL** (Supabase), xử lý Real-time bằng **Socket.io** và giao việc qua **BullMQ**.
1. **Bot Directive (Discord.js):** Nhiệm vụ tương tác trực tiếp với người dùng và server qua Discord, đóng vai trò là một Worker của **BullMQ** để xử lý các tác vụ nền. Yêu cầu **Redis** để đồng bộ.
1. **Frontend Dashboard (React/Vite):** Cung cấp giao diện quản lý trên trình duyệt.
1. **Architecture Tools:** Hệ thống dùng **Winston** để logging, cấu trúc chia Component và Docker để đồng nhất môi trường cho việc mở rộng quy mô.

## Cấu trúc Thư mục

Dự án được phân rã thành các gói chức năng chính sau:

```text
/BOT--Discord-Counselor
├── backend/          # API Server (Express, Prisma, Socket.io, BullMQ, Winston)
├── directive/        # Bot Client (Discord.js, BullMQ Worker)
├── frontend/         # Web Dashboard (React, Vite, Tailwind CSS)
├── docs/             # Tài liệu chi tiết dự án (Kiến trúc, Phát triển, Triển khai)
├── infrastructure/   # Hệ thống hạ tầng mạng & cloud scripts
├── shared/           # Mã nguồn chia sẻ chung (DB Config, Types)
├── docker-compose.yml# Cho phép khởi chạy các thành phần bằng Docker
└── variables.json    # Các biến cấu hình chung
```

## Chạy nhanh cục bộ (Quick Start)

Nếu bạn có Docker, có thể nhanh chóng khởi động cả Redis, Backend và Bot Node như sau:

1. Thiết lập các tệp `.env` dựa theo mẫu `.env.example` trong các thư mục `backend/`, `directive/`.
2. Tại thư mục gốc của dự án, chạy lệnh:

```bash
docker compose up -d
```

Lệnh này sẽ cài đặt NPM, tải Schema tự động, và chạy cả hệ thống ngầm. Bạn có thể xem log tổng qua lệnh `docker compose logs -f`.

3. Đối với Frontend Dashboard, cần chạy riêng thủ công với:

```bash
cd frontend
npm install
npm run dev
```

_(Chi tiết xem thêm tại [Hướng dẫn Phát triển](docs/development.md))_

## Tài liệu Dự án

Chúng tôi đã chia nhỏ các tài liệu để bạn có cái nhìn chi tiết nhất về từng phần trong hệ thống:

- 🏗️ **[Kiến trúc Hệ thống](docs/architecture.md):** Luồng dữ liệu, cách hoạt động của Redis, BullMQ và mô hình database.
- 💻 **[Hướng dẫn Phát triển](docs/development.md):** Hướng dẫn setup, cấu hình `.env`, lệnh Prisma và cách chạy từng service thủ công.
- 🚀 **[Hướng dẫn Triển khai (Deployment)](docs/deployment.md):** Cẩm nang cho việc deploy docker-compose lên VPS hay ứng dụng cloud như Render/Railway/Supabase.
- 🧰 **[Hạ tầng (Infrastructure)](infrastructure/README.md):** Cấu hình hạ tầng Terraform, K8s và Server Scripts.

---

**Yêu cầu hệ thống tối thiểu**: Node.js >= 18 và Docker (dành cho Redis).
