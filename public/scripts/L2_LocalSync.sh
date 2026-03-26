#!/bin/bash
SERVER_USER="long1"
SERVER_IP="orias-counselor.duckdns.org"
SERVER_DIR="${SERVER_DIR:-/home/long1/BOT--Discord-Counselor}"

KEY_SRC="/mnt/c/Users/long1/.ssh/id_rsa"
if [ ! -f "$KEY_SRC" ]; then KEY_SRC="/c/Users/long1/.ssh/id_rsa"; fi
if [ ! -f "$KEY_SRC" ]; then KEY_SRC="C:/Users/long1/.ssh/id_rsa"; fi

cp -f "$KEY_SRC" /tmp/bot_key_secure 2>/dev/null
chmod 600 /tmp/bot_key_secure 2>/dev/null
SSH_KEY="/tmp/bot_key_secure"

echo "===================================================="
echo "Starting Source Code Synchronization"
echo "===================================================="

echo "[1/4] Building Frontend..."
cd frontend
npm install
npm run build
if [ $? -ne 0 ]; then
  echo "Error: Frontend build failed."
  exit 1
fi
cd ..

echo "[2/4] Transferring files via rsync..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.vscode' \
  --exclude 'private/logs' \
  --exclude 'public/docs' \
  -e "ssh -o StrictHostKeyChecking=no -i $SSH_KEY" \
  ./ $SERVER_USER@$SERVER_IP:$SERVER_DIR

echo "[3/4] Updating dependencies and services on Server..."
ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SERVER_USER@$SERVER_IP << ENDSSH
  cd $SERVER_DIR
  
  echo "=> Installing Production packages..."
  cd backend && npm ci --omit=dev && cd ..
  cd directive && npm ci --omit=dev && cd ..
  
  echo "=> Generating Prisma Client (v5)..."
  cd backend
  npx prisma@5 generate
  cd ..
  
  echo "=> Syncing Local Slash Commands to Discord API..."
  npm run deploy:directive
  
  echo "=> Reloading Nginx cache..."
  sudo rm -rf /var/www/html/*
  sudo cp -r frontend/dist/* /var/www/html/
  sudo systemctl restart nginx
  
  echo "=> Restarting PM2 processes..."
  pm2 flush
  pm2 list | grep "discord-backend" || pm2 start npm --name "discord-backend" --node-args="--max-old-space-size=256" -- run start:backend
  pm2 list | grep "discord-bot" || pm2 start npm --name "discord-bot" --node-args="--max-old-space-size=256" -- run start:directive
  pm2 restart all
  pm2 save
ENDSSH

echo "===================================================="
echo "[4/4] Deployment Complete."
echo "===================================================="
