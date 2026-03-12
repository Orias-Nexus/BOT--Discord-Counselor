#!/bin/bash
export TZ="Asia/Ho_Chi_Minh"

PROJECT_DIR="/home/long1/JS--Discord-Counselor"
AUTOPULL_LOG="$PROJECT_DIR/autopull.log"
cd $PROJECT_DIR

if [ -s "$AUTOPULL_LOG" ]; then
    LAST_DATE=$(tail -n 1 "$AUTOPULL_LOG" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
    CURRENT_DATE=$(date +'%Y-%m-%d')
    if [ "$LAST_DATE" != "" ] && [ "$CURRENT_DATE" != "$LAST_DATE" ]; then
        : > "$AUTOPULL_LOG"
    fi
fi

git fetch origin main > /dev/null 2>&1
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})
if [ $LOCAL != $REMOTE ]; then
    : > $AUTOPULL_LOG
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] NEW VERSION DETECTED. UPDATING..."
    git pull origin main
    npm run install:all
    npm run prisma:generate:backend
    npm run deploy:directive
    cd frontend && npm run build
    sudo rm -rf /var/www/html/*
    sudo cp -r dist/* /var/www/html/
    cd ..
    pm2 flush
    rm -rf $PROJECT_DIR/private/logs/*
    pm2 restart all
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] UPDATED SUCCESSFULLY."
else
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] CHECKED: NO CHANGES."
fi

# tree -I 'node_modules'
# crontab -e
# pm2 logs
# */1 * * * * /home/long1/JS--Discord-Counselor/autopull.sh >> /home/long1/JS--Discord-Counselor/autopull.log 2>&1