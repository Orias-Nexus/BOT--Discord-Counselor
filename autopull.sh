#!/bin/bash
PROJECT_DIR="/home/long1/JS--Discord-Counselor"
AUTOPULL_LOG="/home/long1/JS--Discord-Counselor/autopull.log"
cd $PROJECT_DIR
git fetch origin main > /dev/null 2>&1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})
if [ $LOCAL != $REMOTE ]; then
    : > $AUTOPULL_LOG
    echo "[$(date)] NEW VERSION DETECTED! UPDATING...\n"
    git pull origin main
    npm run install:all
    npm run prisma:generate:backend
    cd frontend && npm run build
    sudo rm -rf /var/www/html/*
    sudo cp -r dist/* /var/www/html/
    cd ..
    pm2 flush
    rm -rf $PROJECT_DIR/private/logs/*
    pm2 restart all
    echo "[$(date)] UPDATED SUCCESSFULLY!\n"
else
    echo "[$(date)] CHECKED: No changes."
fi
