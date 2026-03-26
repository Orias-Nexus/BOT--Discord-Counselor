#!/bin/bash
export TZ="Asia/Ho_Chi_Minh"

BOT_PROJ="~/JS--Discord-Counselor"
AUTOPULL_LOG="$BOT_PROJ/autopull.log"
LOCK_FILE="/tmp/autopull.lock"

exec 200>"$LOCK_FILE"
if ! flock -n 200; then
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] SKIPPED: Another update is running." >> "$AUTOPULL_LOG"
    exit 0
fi

cd "$BOT_PROJ"

if [ -s "$AUTOPULL_LOG" ]; then
    LAST_DATE=$(tail -n 1 "$AUTOPULL_LOG" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}')
    CURRENT_DATE=$(date +'%Y-%m-%d')
    if [ "$LAST_DATE" != "" ] && [ "$CURRENT_DATE" != "$LAST_DATE" ]; then
        : > "$AUTOPULL_LOG"
    fi
fi

while true; do
    git fetch origin main > /dev/null 2>&1
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse @{u})

    if [ "$LOCAL" = "$REMOTE" ]; then
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] CHECKED: NO CHANGES."
        break
    fi

    : > "$AUTOPULL_LOG"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] NEW VERSION DETECTED. UPDATING..."
    git pull origin main
    npm run install:all
    npm run prisma:generate:backend
    npm run deploy:directive
    cd frontend && npm run build
    sudo rm -rf /var/www/html/*
    sudo cp -r dist/* /var/www/html/
    cd "$BOT_PROJ"
    pm2 flush
    rm -rf "$BOT_PROJ/private/logs/"*
    pm2 restart all
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] UPDATED SUCCESSFULLY."
done

# tree -I 'node_modules'
# crontab -e
# pm2 logs
# htop