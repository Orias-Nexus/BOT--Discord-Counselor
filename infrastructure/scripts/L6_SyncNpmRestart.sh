#!/bin/bash
# L6: Chỉ sync, npm ci và restart
KEY_HOME="/tmp"
KEY_TYPE="gcp_key"
KEY_PATH="${KEY_HOME}/${KEY_TYPE}"

PROJ_NAME="BOT--Discord-Counselor"
LOCAL_USER="orias"
SERVER_USER="long1"
SERVER_IP="35.206.78.212" # orias-counselor.duckdns.org
SERVER_DIR="${SERVER_DIR:-/home/${SERVER_USER}/${PROJ_NAME}}"

KEY_SRC="$HOME/.ssh/${KEY_TYPE}"
if [ ! -f "$KEY_SRC" ]; then KEY_SRC="/mnt/c/Users/${LOCAL_USER}/.ssh/${KEY_TYPE}"; fi
if [ ! -f "$KEY_SRC" ]; then KEY_SRC="C:/Users/${LOCAL_USER}/.ssh/${KEY_TYPE}"; fi

cp -f "$KEY_SRC" "$KEY_PATH" 2>/dev/null
chmod 600 "$KEY_PATH" 2>/dev/null
SSH_KEY="$KEY_PATH"

echo "===================================================="
echo "L6: Starting Source Code Synchronization (Sync, Npm Install & Restart)"
echo "===================================================="

echo "[0/4] Switching to Production Environment Variables..."
for dir in backend frontend directive; do
  if [ -f "$dir/.env.prod" ]; then
    if [ -f "$dir/.env.test" ]; then
      rm -f "$dir/.env"
    elif [ -f "$dir/.env" ]; then
      mv "$dir/.env" "$dir/.env.test"
    fi
    cp "$dir/.env.prod" "$dir/.env"
    echo "  -> Applied .env.prod for $dir"
  fi
done

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

echo "[3/4] Updating Dependencies and restarting services on Server..."
ssh -o StrictHostKeyChecking=no -i $SSH_KEY $SERVER_USER@$SERVER_IP << ENDSSH
  cd $SERVER_DIR
  
  echo "=> Installing Production packages..."
  cd backend && npm ci --omit=dev && cd ..
  cd directive && npm ci --omit=dev && cd ..
  
  echo "=> Syncing Local Slash Commands to Discord API..."
  npm run deploy:directive
  
  echo "=> Reloading Nginx cache..."
  sudo rm -rf /var/www/html/*
  sudo cp -r frontend/dist/* /var/www/html/
  sudo nginx -t && sudo systemctl reload nginx
  
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
