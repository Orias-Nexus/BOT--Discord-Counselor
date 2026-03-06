# My Discord System

Hệ thống Discord Assistant: **Bot** (Discord.js) + **Backend API** (Express) + **Web Dashboard** (React).

## Cấu trúc dự án

```
/my-discord-system
├── .github/          # CI/CD: tự động test và deploy
├── backend/          # API Server cho Web Dashboard (Express)
├── directive/        # Giao diện Discord: scripts, slashs, actions (gọi Backend API)
├── database/         # Scripts, schema Supabase, dữ liệu chung
├── frontend/         # Giao diện Web Dashboard (Vite + React)
├── infra/            # Terraform, Kubernetes, scripts server
├── shared/           # Types, utils dùng chung
├── docker-compose.yml
└── README.md
```

## Chạy nhanh (local)

### Backend (API + DB)

```bash
cd backend
cp .env.example .env   # điền SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev            # http://localhost:4000
```

### Directive (Discord client — scripts, slashs, actions)

```bash
cd directive
# .env: DISCORD_TOKEN, APPLICATION_ID, BACKEND_API_URL
npm install
npm run deploy         # đăng ký slash commands (một lần)
npm run dev
```

Directive gọi Backend API; Backend nói chuyện Supabase (schema `DiscordCounselor`).

### Frontend (tạm thời chưa cần)

```bash
cd frontend && npm install && npm run dev   # http://localhost:3000
```

## Chạy bằng Docker

```bash
# Tạo .env cho bot (bot/.env) với DISCORD_TOKEN, APPLICATION_ID
docker compose up -d
```

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend: [http://localhost:4000](http://localhost:4000)  
- Directive (Discord client) chạy trong container (cần token trong directive/.env).

## Tài liệu

- [Kiến trúc & cài đặt](docs/README.md)
- [Lệnh Bot](docs/RUNCMDS.md)
- [Lộ trình](docs/ROADMAP.md)

## Yêu cầu

- Node.js >= 18

