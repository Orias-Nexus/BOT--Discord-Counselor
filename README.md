# My Discord System

Hệ thống Discord Assistant: **Bot** (Discord.js) + **Backend API** (Express) + **Web Dashboard** (React).

## Cấu trúc dự án

```
/my-discord-system
├── .github/          # CI/CD: tự động test và deploy
├── backend/          # API Server cho Web Dashboard (Express)
├── bot/              # Logic Discord: kết nối, lệnh, event
├── database/         # Scripts, schema (Prisma/Drizzle), dữ liệu chung
├── docs/             # Tài liệu kiến trúc, cài đặt
├── frontend/         # Giao diện Web Dashboard (Vite + React)
├── infra/            # Terraform, Kubernetes, scripts server
├── shared/           # Types, utils dùng chung
├── docker-compose.yml
└── README.md
```

## Chạy nhanh (local)

### Bot

```bash
cd bot
cp .env.example .env   # điền DISCORD_TOKEN, APPLICATION_ID
npm install
npm run deploy
npm run dev
```

### Backend + Frontend

```bash
# Terminal 1
cd backend && npm install && npm run dev    # http://localhost:4000

# Terminal 2
cd frontend && npm install && npm run dev   # http://localhost:3000
```

Dashboard sẽ gọi API qua proxy (`/api`, `/health` → backend).

## Chạy bằng Docker

```bash
# Tạo .env cho bot (bot/.env) với DISCORD_TOKEN, APPLICATION_ID
docker compose up -d
```

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend: [http://localhost:4000](http://localhost:4000)  
- Bot chạy trong container (cần token trong bot/.env).

## Tài liệu

- [Kiến trúc & cài đặt](docs/README.md)
- [Lệnh Bot](docs/RUNCMDS.md)
- [Lộ trình](docs/ROADMAP.md)

## Yêu cầu

- Node.js >= 18

