# Local Development Guide

This document provides end-to-end installation segments for software engineers or operators who want to test the entire project source code on a personal computer (localhost).

## System Requirements

To contribute to the project, your machine must be provisioned with:

- **Node.js** >= `18.x.x` (To manage NPM Packages)
- **Docker** and **Docker Compose** (Required to emulate the Redis Queue or Database environments locally)
- A Postgres DB (Using local Postgres or a Cloud Database like Supabase).

---

## 1. Environment Variables

Before installing any tools, ensure that the applications are aware of and linked to each other by creating and loading the `.env` files.
Clone the `.env.example` file to `.env` in the respective directories, then fill in the corresponding information fields.

### For the `backend/` directory

- Contains the Database connection URL. (Example: `DATABASE_URL` via Prisma, `DATABASE_DIRECT_URL`).
- Contains the `REDIS_STORAGE_URL` set to `redis://127.0.0.1:6379` or the Docker Redis host.

### For the `directive/` directory

- Attach the verification Token through the Discord Developer Portal key.
- Similar to the backend, it contains the `REDIS_STORAGE_URL` to dispatch/listen to assigned Jobs via BullMQ.

### For the `frontend/` directory

- Add the `VITE_API_URL` path to connect the React Web Client to the backend API server.

---

## 2. Dependency Installation and Local Startup (Direct Execution)

Instead of bootstrapping everything through Docker (for fast deployment), manual execution allows developers to easily track bugs and monitor Console logs for seamless coding.

### Step 2.1: Background Redis Initialization (Required)

The Queue and Rate Limit system operate entirely on Redis. Please open Docker and execute:

```bash
docker compose up redis -d
```

### Step 2.2: Backend Server Setup

In _Terminal 1_:

```bash
cd backend
npm install
npm run dev
```

> **Prisma Note**: On the first run, if the Backend reports a missing Prisma Client, you need to generate or apply the DB:
>
> - `npx prisma db push` (Push the schema to the sample DB)
> - `npx prisma generate` (Initialize the ORM classes for the Backend)

### Step 2.3: Bot/Directive Worker Setup

In _Terminal 2_:

```bash
cd directive
npm install
npm run deploy    # Register the list of Slash Commands (//... ) to the Bot on the Discord platform
npm run dev       # Start the bot online, the Bot in the chat channel should now display the Green indicator (Online)
```

### Step 2.4: Dashboard Frontend Setup

In _Terminal 3_:

```bash
cd frontend
npm install
npm run dev       # The Vite Server will launch, providing a localhost port (e.g., 3000) for the Dashboard UI
```

Once Terminal 2 is active and Node Express startup completes in Terminal 1, Real-time notification features will transmit live data from Discord directly to your React interface.
