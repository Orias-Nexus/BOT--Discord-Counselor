# Hướng dẫn cài đặt

## Yêu cầu

- Node.js >= 18
- npm hoặc pnpm

## Chạy từng phần (local)

### 1. Bot (Discord)

```bash
cd bot
cp .env.example .env   # hoặc tạo .env với DISCORD_TOKEN, APPLICATION_ID
npm install
npm run deploy        # đăng ký slash commands
npm run dev           # chạy bot
```

### 2. Backend (API)

```bash
cd backend
cp .env.example .env
npm install
npm run dev           # http://localhost:4000
```

### 3. Frontend (Dashboard)

```bash
cd frontend
npm install
npm run dev           # http://localhost:3000, proxy /api và /health tới backend
```

### 4. Chạy cả hệ thống bằng Docker

Ở thư mục gốc:

```bash
docker compose up -d
```

Xem chi tiết trong `README.md` và `docker-compose.yml` tại thư mục gốc.
