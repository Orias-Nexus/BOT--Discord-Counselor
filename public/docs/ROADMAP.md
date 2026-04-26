# Discord Counselor — Roadmap

> System development process from foundation to deployment.

---

## 1. Architecture

- [x] Design Monorepo architecture: `backend/`, `directive/`, `frontend/`, `shared/`.
- [x] Define core technologies: Node.js, Discord.js v14, Express, Prisma ORM, React + Vite.
- [x] Design Variables Engine with 4 processing phases: Guards → Modifiers → Actions → Placeholders.
- [x] Design Script Registry (`runScript.js`) for automatic script-to-module mapping.
- [x] Design Event Registry (`eventRegistry.js`) for mapping Discord Events to Scripts.

## 2. Infrastructure

- [x] Configure `docker-compose.yml` with 4 services: `redis`, `backend`, `frontend`, `directive`.
- [x] Configure Redis Alpine for Caching & Message Queue (port 6379).
- [x] Configure Nginx reverse proxy for Frontend (port 3000 → 80).
- [x] Set up `render.yaml` for Render.com deployment.
- [x] Configure `.gitignore` and `.dockerignore` for each service.

## 3. Database

- [x] Initialize hosted PostgreSQL on Supabase.
- [x] Design schema: `servers`, `members`, `users`, `channels`, `embeds`, `messages`, `functions`, `levels`.
- [x] Set up Prisma ORM with `schema.prisma` (introspected from Supabase).
- [x] Configure Row Level Security (RLS) for sensitive tables.
- [x] Create Enum types: `category_type_enum`, `member_status_enum`, `message_type_enum`.
- [x] Migrate entire repository from Supabase JS Client to Prisma Client.

## 4. Backend API

- [x] Initialize Express Server (port 4000) with MVC structure: Controllers → Services → Repositories.
- [x] Create API Routes: `serverRoutes`, `memberRoutes`, `channelRoutes`, `embedRoutes`, `messageRoutes`, `functionRoutes`, `levelRoutes`, `authRoutes`.
- [x] Integrate Winston Logger (daily rotation, centralized in `private/logs/`).
- [x] Integrate Redis (ioredis) + BullMQ Queue for asynchronous tasks.
- [x] Integrate Socket.io Server for real-time communication.
- [x] Integrate Discord OAuth2 + JWT Authentication.
- [x] Completely remove `@supabase/supabase-js` dependency from backend.

## 5. Directive (Discord Bot)

- [x] Initialize Discord.js v14 Client with full Intents.
- [x] Build Variables Engine: resolve Guards, Modifiers, Actions, Placeholders in phase order.
- [x] Implement 46 scripts (Server, Category, Channel, Member, Embed, Greeting/Leaving/Boosting).
- [x] Register 4 Events: `GuildMemberAdd`, `GuildMemberRemove`, `GuildMemberUpdate`, `VoiceStateUpdate`.
- [x] Integrate BullMQ Worker to process tasks from Backend Queue.
- [x] Integrate Winston Logger for the Bot.
- [x] Refactor API Fetcher (`api.js`) to use `fetch` targeting Backend instead of Supabase.

## 6. Frontend Dashboard

- [x] Initialize Vite + React 18 project.
- [x] Integrate TailwindCSS v4 with `@tailwindcss/vite` plugin.
- [x] Build DashboardLayout (Sidebar + Header + Outlet).
- [x] Build AuthContext (JWT) + SocketContext (Socket.io-client).
- [x] Implement pages: Login, Overview (Server Picker), Members, Messages, Settings.
- [x] Configure Axios interceptor to attach JWT to all requests.
- [x] Connect real API (fetch data from Backend endpoints).
- [x] Build data editing forms (Embed Editor, Role Picker, etc.).
- [x] Design responsive layouts for mobile/tablet.

## 7. Deployment

- [x] Build production bundle for Backend (`npm run build`).
- [x] Build production bundle for Frontend (`vite build`).
- [x] Verify end-to-end Docker Compose functionality locally.
- [x] Deploy to Render.com or VPS (following `render.yaml`).
- [x] Verify SSL, domain, and monitoring post-deployment.
