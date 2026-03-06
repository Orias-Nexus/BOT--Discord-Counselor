# Database

Thư mục chứa cấu hình và dữ liệu dùng chung cho Backend và Bot.

## Nội dung hiện tại

- `logs.json` — dữ liệu log (bot/backend có thể đọc/ghi qua đường dẫn `../database/` hoặc biến môi trường).

## Mở rộng sau

- **Prisma**: thêm `schema.prisma` và chạy `prisma generate` / `prisma migrate`.
- **Drizzle**: thêm schema trong `schema/` và config kết nối.
- **Supabase**: cấu hình trong `supabase/config.toml` hoặc dùng env.

## Ví dụ Prisma schema (placeholder)

```prisma
// schema.prisma - uncomment khi dùng
// generator client {
//   provider = "prisma-client-js"
// }
// datasource db {
//   provider = "sqlite"
//   url      = env("DATABASE_URL")
// }
// model GuildConfig {
//   id     String @id
//   prefix String @default("!")
// }
```
