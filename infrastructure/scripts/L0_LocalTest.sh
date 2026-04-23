#!/bin/bash

# --- Discord Counselor Development Startup Script ---
# This script starts the backend, directive, and frontend in order.

# Color variables for pretty output
GRE='\033[0;32m'
BLU='\033[0;34m'
YEL='\033[1;33m'
CYA='\033[0;36m'
RED='\033[0;31m'
NOC='\033[0m' # No Color

SERVICE_PIDS=()
IS_CLEANING_UP=0
WORKSPACE_HINT='BOT--Discord-Counselor'

switch_to_test_env() {
    echo "[0/4] Switching to Test Environment Variables..."
    for service_dir in backend frontend directive; do
        if [ -f "$service_dir/.env.test" ]; then
            if [ -f "$service_dir/.env.prod" ]; then
                rm -f "$service_dir/.env"
            elif [ -f "$service_dir/.env" ]; then
                mv "$service_dir/.env" "$service_dir/.env.prod"
            fi
            cp "$service_dir/.env.test" "$service_dir/.env"
            echo "  -> Applied .env.test for $service_dir"
        fi
    done
}

echo -e "${BLU}======================================================${NOC}"
echo -e "${BLU}   Discord Counselor - Development Startup Script     ${NOC}"
echo -e "${BLU}======================================================${NOC}"

# Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: docker is not installed. Please install Docker to run Redis.${NOC}" >&2
  exit 1
fi

# 1. Start Redis
echo -e "\n${YEL}[1/4] Starting Redis Container...${NOC}"
docker compose up redis -d
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Redis. Please ensure Docker Desktop is running.${NOC}"
    exit 1
fi

# Function to start a service
# Usage: start_service <directory> <name> <pid_var_name> <init_commands...>
start_service() {
    local dir=$1
    local name=$2
    local pid_var=$3
    shift 3
    local init_cmds=("$@")

    echo -e "\n${YEL}>>> Setting up ${name} (${dir})...${NOC}"
    cd "$dir" || exit 1

    # Run initialization commands
    for cmd in "${init_cmds[@]}"; do
        echo -e "${CYA}Running: ${cmd}${NOC}"
        eval "$cmd"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error during ${name} initialization: ${cmd}${NOC}"
            exit 1
        fi
    done

    # Start the development server in the background
    echo -e "${GRE}Starting ${name} dev server...${NOC}"
    npm run dev &
    eval "$pid_var=$!"
    SERVICE_PIDS+=("$!")
    cd ..
}

# 2. Setup & Start Backend
# npm install
switch_to_test_env
start_service "backend" "Backend API" BACKEND_PID "npm install"

# 3. Setup & Start Directive
start_service "directive" "Directive Bot" DIRECTIVE_PID "npm install" "npm run deploy"

# 4. Setup & Start Frontend
start_service "frontend" "Frontend UI" FRONTEND_PID "npm install"

echo -e "\n${BLU}======================================================${NOC}"
echo -e "${GRE}   All services are now running in the background!    ${NOC}"
echo -e "${BLU}   - Backend (Port 4000) PID: ${BACKEND_PID}${NOC}"
echo -e "${BLU}   - Directive (Bot)     PID: ${DIRECTIVE_PID}${NOC}"
echo -e "${BLU}   - Frontend (Port 3000) PID: ${FRONTEND_PID}${NOC}"
echo -e "${BLU}======================================================${NOC}"
echo -e "${YEL}Press Ctrl+C to stop all services.${NOC}"

# Handle shutdown
cleanup() {
    if [ "$IS_CLEANING_UP" -eq 1 ]; then
        return
    fi
    IS_CLEANING_UP=1

    echo -e "\n\n${RED}Shutting down services...${NOC}"
    local pid

    # 1) Stop tracked jobs first.
    for pid in "${SERVICE_PIDS[@]}"; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            # Trên Windows, /T sẽ kill cả cây process của npm run dev.
            taskkill /PID "$pid" /T /F >/dev/null 2>&1 || kill "$pid" 2>/dev/null
        fi
    done

    # 2) Stop any remaining background jobs created by this shell.
    for pid in $(jobs -p 2>/dev/null); do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            taskkill /PID "$pid" /T /F >/dev/null 2>&1 || kill "$pid" 2>/dev/null
        fi
    done

    # 3) Last-resort cleanup: only kill node.exe whose command line points to this workspace.
    powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& {
        \$processes = Get-CimInstance Win32_Process -Filter \"Name = 'node.exe'\" |
            Where-Object { \$_.CommandLine -and \$_.CommandLine -like '*$WORKSPACE_HINT*' }
        foreach (\$process in \$processes) {
            try { Stop-Process -Id \$process.ProcessId -Force -ErrorAction Stop } catch {}
        }
    }" >/dev/null 2>&1

    echo -e "${GRE}Done.${NOC}"
}

trap cleanup SIGINT SIGTERM EXIT

# Keep script running to maintain background processes
wait