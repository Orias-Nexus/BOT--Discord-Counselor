# System Architecture

This document explains the high-level technical landscape of Discord Counselor.

## Block Diagram (High-Level Model)

```text
+----------------+      Socket.io      +--------------------+
|                | <-----------------> |                    |
| Front-End (Web)|                     |    Backend API     | <----+
| React/Vite     | -------- REST ----> |  (Express + Node)  |      | Prisma ORM
+----------------+                     +--------------------+      |
                                        |          |               |
                                     BullMQ     BullMQ         +--------+
                                        |          |           | Postgres|
+----------------+                      v          v           | Database|
|     Discord    | <--- Discord.js --> +--------------------+  +--------+
|   Discord User |                     |  Bot & Worker      |      | Prisma ORM
+----------------+                     |  (Directive Node)  | <----+
                                       +--------------------+
```

## Core Components

### 1. Backend API (Express)
Acts as the central data controller:
- Provides a RESTful API for the Frontend interface.
- Contains authentication logic (Discord OAuth2, JWT).
- Operates as a Web Server and Socket.io server, pushing real-time events directly to administrators monitoring via the web dashboard.
- Dispatches background jobs (Tasks) to Redis via BullMQ to be consumed by the Bot Directive system.

### 2. Bot & Worker (Directive)
- Connects through the `discord.js` library to interact directly with users via Slash Commands and Interactions on the Discord Server.
- Shares the `Prisma` connection to the Database to execute large queries or high-speed data retrievals bypassing the Backend API (for non-real-time actions).
- Runs as a Node Worker for the BullMQ Queue (consuming jobs from Redis). This approach is crucial for handling high-volume messages/tasks while mitigating Discord API Rate Limits.

### 3. Queue Server (Redis / BullMQ)
Acts as the Load Balancer & Queue Management layer:
- BullMQ stores pending execution tasks (e.g., sending messages, creating channels, broadcasting alerts) in Redis as queued jobs.
- The Directive Bot pulls and processes these jobs sequentially. For failed jobs, it allows easy configuration of Retries or Delayed executions.

### 4. Database (PostgreSQL & Prisma)
- Utilizes a robust PostgreSQL database natively hosted on `Supabase`.
- Uses `Prisma ORM` to synchronize the Database Schema across all Backend/Directive applications, ensuring data format consistency and preventing structural errors.

## Logging

Server components (Backend and Directive) utilize `winston` combined with `winston-daily-rotate-file`:
- Indicates whether the server maintains a healthy uptime or has stopped.
- Automatically compresses and archives old log files to save disk storage.
