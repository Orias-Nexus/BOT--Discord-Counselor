<h1 style="color: #2b78e4;">Discord Counselor System</h1>

The Discord Counselor System is a robust, enterprise-ready infrastructure designed to bridge the gap between Discord communities and web-based management. This project comprises a modular Microservices-lite architecture to run background tasks reliably, synchronize real-time data, and provide comprehensive community management.

<h2 style="color: #4CAF50;">Core Features</h2>

* **Real-time Web Dashboard Synchronization:** Seamless data streaming via Socket.io to a web interface for live monitoring and administration.
* **Asynchronous Queue Management:** High-volume operational background tasks are safely scheduled and consumed using BullMQ and Redis to bypass Discord API rate constraints.
* **Persistent Database Integration:** Unified data structures utilizing PostgreSQL (Supabase) and Prisma ORM to guarantee data concurrency across all microservices.
* **Slash Command Architecture:** Fully dynamic Discord Application Commands implementation for rapid user interaction.
* **Containerized Deployment:** Docker-ready building contexts for isolated, platform-agnostic environments in Production.

<h2 style="color: #ff9800;">Directory Structure</h2>

```text
/BOT--Discord-Counselor
|-- assets/                 # Configuration assets (features.json, variables.json)
|-- backend/                # API Server (Express.js, Prisma ORM, Socket.io)
|-- directive/              # Bot Client Worker (Discord.js, BullMQ Node)
|-- frontend/               # Web Dashboard Client (React, Vite, Tailwind CSS)
|-- docs/                   # Detailed Technical Documentation Repository
|-- infrastructure/         # Automated Shell Scripts and Cloud Architecture Guides
|-- docker-compose.yml      # Orchestration instructions for Docker environments
|-- render.yaml             # Blueprint Configuration for Render.com Auto-deployment
```

<h2 style="color: #e91e63;">Documentation Index</h2>

To dive deeper into the technical segments of the system, please refer to the following English documentation:

* [System Architecture](docs/architecture.md): Data workflow, Redis topology, and Queue state management.
* [Local Development Guide](docs/development.md): Detailed local setup tutorials for `.env` configuration, Prisma workflows, and direct Node execution.
* [Deployment Setup](docs/deployment.md): Blueprints for hosting on Cloud platforms (Render) or Virtual Private Servers (Docker Compose).
* [Infrastructure Commands](infrastructure/README.md): Fast, actionable CLI commands for Server operators.

<h2 style="color: #607d8b;">System Requirements</h2>

* Runtime: Node.js (Version 18.0.0 or higher)
* Cache: Docker Desktop (Required for Redis emulator)
* Database: PostgreSQL connection (e.g., Supabase)
