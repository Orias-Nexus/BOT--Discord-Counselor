# Kiến trúc hệ thống

## Tổng quan

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│   Backend   │────▶│  Database   │
│  (Dashboard)│     │  (API)      │     │  (shared)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          │ (tùy chọn: Backend gọi Bot hoặc queue)
                          ▼
                   ┌─────────────┐
                   │    Bot      │────▶ Discord API
                   │  (Discord)  │
                   └─────────────┘
```

- **Frontend**: Giao diện web (Vite + React), gọi Backend API.
- **Backend**: Express API, phục vụ Dashboard và có thể điều khiển/đồng bộ với Bot.
- **Bot**: Discord.js, xử lý slash commands và events.
- **Database**: Dữ liệu dùng chung (file JSON, sau có thể Prisma/Drizzle/Supabase).
- **Shared**: Types/utils dùng chung giữa backend, bot, frontend.

## Thư mục gốc

| Thư mục        | Mô tả |
|----------------|--------|
| `.github/`     | CI/CD workflows (test, deploy) |
| `backend/`     | API Server (Express) |
| `bot/`         | Discord bot (commands, events, scripts) |
| `database/`    | Schema, scripts DB, dữ liệu chung |
| `docs/`        | Tài liệu kiến trúc, cài đặt |
| `frontend/`    | Web Dashboard (React) |
| `infra/`       | Terraform, K8s, scripts server |
| `shared/`      | Types, interfaces, utils chung |
