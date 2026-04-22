#!/bin/bash

# --- Discord Counselor Development Startup Script ---
# This script starts the backend, directive, and frontend in order.

# Color variables for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   Discord Counselor - Development Startup Script    ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check for Docker
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: docker is not installed. Please install Docker to run Redis.${NC}" >&2
  exit 1
fi

# 1. Start Redis
echo -e "\n${YELLOW}[1/4] Starting Redis Container...${NC}"
docker compose up redis -d
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Redis. Please ensure Docker Desktop is running.${NC}"
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

    echo -e "\n${YELLOW}>>> Setting up ${name} (${dir})...${NC}"
    
    if [ ! -f "$dir/.env" ]; then
        if [ -f "$dir/.env.example" ]; then
            echo -e "${CYAN}Creating .env from .env.example for ${name}...${NC}"
            cp "$dir/.env.example" "$dir/.env"
        else
            echo -e "${RED}Warning: .env file missing for ${name} and no .env.example found.${NC}"
        fi
    fi

    cd $dir || exit

    # Run initialization commands
    for cmd in "${init_cmds[@]}"; do
        echo -e "${CYAN}Running: ${cmd}${NC}"
        eval $cmd
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error during ${name} initialization: ${cmd}${NC}"
            exit 1
        fi
    done

    # Start the development server in the background
    echo -e "${GREEN}Starting ${name} dev server...${NC}"
    npm run dev &
    eval "$pid_var=$!"
    cd ..
}

# 2. Setup & Start Backend
start_service "backend" "Backend API" BACKEND_PID "npm install" "npx prisma generate"

# 3. Setup & Start Directive
start_service "directive" "Directive Bot" DIRECTIVE_PID "npm install" "npm run deploy"

# 4. Setup & Start Frontend
start_service "frontend" "Frontend UI" FRONTEND_PID "npm install"

echo -e "\n${BLUE}======================================================${NC}"
echo -e "${GREEN}   All services are now running in the background!    ${NC}"
echo -e "${BLUE}   - Backend (Port 4000) PID: ${BACKEND_PID}${NC}"
echo -e "${BLUE}   - Directive (Bot)     PID: ${DIRECTIVE_PID}${NC}"
echo -e "${BLUE}   - Frontend (Port 3000) PID: ${FRONTEND_PID}${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"

# Handle shutdown
cleanup() {
    echo -e "\n\n${RED}Shutting down services...${NC}"
    kill $BACKEND_PID $DIRECTIVE_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Done.${NC}"
    exit
}

trap cleanup SIGINT

# Keep script running to maintain background processes
wait
