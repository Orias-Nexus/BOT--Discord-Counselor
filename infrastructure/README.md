# Development & Infrastructure Guide

This guide provides the essential commands required to develop locally and deploy the Discord Counselor infrastructure.

## 1. Local Development (Windows/macOS)

### Prerequisites Setup

Ensure Docker Desktop is running to spin up the local Redis instance.

```bash
docker compose up redis -d
```

### Backend (API & Real-time)

Setup the backend API server on port 4000:

```bash
cd backend
npm install
npx prisma generate    # Required on first initialization
npm run dev
```

### Directive (Discord Bot)

Setup the background bot worker:

```bash
cd directive
npm install
npm run deploy         # Register Discord Slash Commands
npm run dev
```

### Frontend (Web Dashboard)

Setup the React frontend on port 3000:

```bash
cd frontend
npm install
npm run dev
```

---

## 2. Server Deployment (Linux/VPS)

To deploy the full stack on a Linux Server (Ubuntu/Debian) using Docker Compose.

**Step 1: Clone Repository**

```bash
git clone <repository_url> ~/BOT--Discord-Counselor
cd ~/BOT--Discord-Counselor
```

**Step 2: Environment Configuration**
Copy configuration templates and fill in your Cloud Database (Supabase) and Discord tokens.

```bash
cp backend/.env.example backend/.env
cp directive/.env.example directive/.env
```

_(Ensure `REDIS_STORAGE_URL=redis://redis:6379` is set in `.env` files for Docker networking)_

**Step 3: Docker Orchestration**
Build and start all containers in detached mode:

```bash
docker compose build
docker compose up -d
```

**Step 4: Maintenance Commands**
Monitor logs across all microservices:

```bash
docker compose logs -f
```

To stop the entire system:

```bash
docker compose down
```
