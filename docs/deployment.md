# Deployment Guide

Running the system locally is insufficient; you will want to deploy this Bot/Dashboard platform to a production environment for public access.

The Discord Counselor system is modularized and highly recommended to be configured on a Cloud Virtual Machine (VPS).

## Recommended Cloud Infrastructure Specs

For optimal performance with this architecture, we need:

1. Database Server: `PostgreSQL` (We recommend **Supabase** for high scalability and easy deployment).
2. Redis Server: We recommend **Upstash** for Serverless environments or static Node deployments.
3. Node.js Logic Computation: **Render**, **Railway**, **Fly.io**, or an **AWS VPS**.

---

## Method 1: Cloud Platform Deployment (Render & Railway)

This method is highly developer-friendly and optimizes costs (can run entirely on free tiers for low traffic). Follow this Render baseline:

### Step 1: Backend Server Setup

1. Link your Render account with the Github Repository of this project.
2. Create a new `Web Service` (Used to expose Ports for HTTP User connections). Point the Root Directory to `backend/`.
3. Specify the runtime commands as follows:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `node src/index.js`
4. Copy all Environment Variables from the `.env` file into the Environment config of this Render Service so the server can read them during runtime. (Critical: Ensure the latest `DATABASE_URL` from Supabase and `REDIS_URL` from Upstash are provided).

### Step 2: Directive Bot/Worker Setup

The Bot Worker does not require web port binding to listen to HTTP interactions; hence, Render supports the `Background Worker` instance type.

1. Create a `Background Worker` node, pointing the root directory to `directive/`.
2. Define the Start/Build commands as follows:
   - Build Command: `npm install`
   - Start Command: `node src/index.js` (or use the package script like `npm start`)
3. Set up the Environment Variables from the Config file (Provide the Worker with the exact same DB Database URL and Redis URL as the Backend).

### Step 3: Register Slash Commands for the Bot

Unlike the Web Server, the Discord Bot application needs to register its Slash Commands. You can use the SSH or Exec Terminal feature on Render's Directive Node Worker and run: `npm run deploy` exactly once in the Terminal to provision the CLI control UI to the Discord Server.

*(Future updates will build the Static Dashboard as SPA/SSG directly to Vercel or Netlify CDN for lightning-fast loads instead of utilizing a Render Service).*

---

## Method 2: Professional Docker Compose Deployment (VPS/On-Premise)

For administrators prioritizing self-hosting on a dedicated Virtual Machine equipped with Docker, the `docker-compose.yml` file is provided.

1. Pull the project code to your Virtual Machine or Cloud VPS.
2. Edit the `.env` files to utilize internal URLs within the Docker Network namespace. (e.g., `REDIS_URL=redis://redis:6379`).
3. Execute the command to build the entire container suite:

```bash
docker compose build
docker compose up -d
```

Docker will orchestrate the entire setup. Afterward, configure a Reverse Proxy (such as `Nginx` / `Traefik`) by binding localhost Ports to your target Domain Name pointing to the VPS Server IP.
