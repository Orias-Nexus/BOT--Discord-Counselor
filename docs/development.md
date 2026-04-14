# Hướng dẫn Phát triển (Local Development)

Tài liệu này cung cấp các phân đoạn cài đặt từ A đến Z cho những lập trình viên hoặc người vận hành muốn chạy thử toàn bộ mã nguồn của dự án trên máy tính cá nhân (localhost).

## Yêu cầu Hệ thống

Để tham gia dự án, máy tính của bạn phải chuẩn bị sẵn:
- **Node.js** >= `18.x.x` (Quản lý các Package NPM)
- **Docker** và **Docker Compose** (Dành cho việc giả lập môi trường Redis Queue hay Database)
- Một DB Postgres (Sử dụng Postgres local hoặc Cloud Database như Supabase).

---

## 1. Biến môi trường

Trước khi cài đặt bất kỳ công cụ nào, hãy đảm bảo rằng các ứng dụng biết và liên kết với nhau bằng cách tạo và nạp tệp `.env`.
Hãy nhân bản tệp `.env.example` thành `.env` ở các thư mục sau đó điền trường thông tin tương ứng.

### Đối với thư mục `backend/`
- Chứa URL kết nối tới CSDL. (Ví dụ: `DATABASE_URL` dùng Prisma, `DIRECT_URL`).
- Chứa `REDIS_URL` bằng `redis://localhost:6379` hoặc host Redis của docker.

### Đối với thư mục `directive/`
- Gắn Token xác nhận thông qua khóa của Discord Developer Portal.
- Tương tự như backend, chứa `REDIS_URL` để gọi/nghe Job phân công qua BullMQ.

### Đối với thư mục `frontend/`
- Thêm đường dẫn `VITE_API_URL` để connect React Web Client đến API server.

---

## 2. Cài đặt Dependency và Khởi chạy Cục bộ (Trực tiếp)

Thay vì chạy hết tất cả bằng Docker (cho mục đích nhanh), việc chạy thủ công giúp các lập trình viên dễ dàng theo dõi lỗi, xem Console logs để code dễ dàng.

### Bước 2.1: Chạy nền Redis (Bắt buộc)
Hệ thống Queue và Rate Limit dựa hoàn toàn vào Redis. Vui lòng mở Docker và chạy:
```bash
docker compose up redis -d
```

### Bước 2.2: Setup Backend Server
Tại *Terminal số 1*:
```bash
cd backend
npm install
npm run dev
```

> **Lưu ý Prisma**: Ở lần chạy đầu, nếu Backend báo thiếu Prisma Client, bạn cần generate hoặc apply DB:
> - `npx prisma db push` (Đẩy schema vào DB mẫu)
> - `npx prisma generate` (Khởi tạo class cho Backend)

### Bước 2.3: Setup Bot/Directive Worker
Tại *Terminal số 2*:
```bash
cd directive
npm install
npm run deploy    # Đăng ký danh sách các Slash Commands (//... ) lên Bot trên nền tảng Discord
npm run dev       # Bắt đầu bot trực tuyến, lúc này Bot trên kênh chat sẽ xanh (Online)
```

### Bước 2.4: Setup Dashboard Frontend
Tại *Terminal số 3*:
```bash
cd frontend
npm install
npm run dev       # Server Vite sẽ khởi chạy cung cấp port localhost:3000 (Ví dụ) cho UI Dashboard
```

Khi Terminal 2 hoạt động và Node Express khởi động hoàn tất ở Terminal 1, các tính năng thông báo Real-time sẽ bắt đầu truyền trực tiếp dữ liệu từ Discord vào giao diện React của bạn.
