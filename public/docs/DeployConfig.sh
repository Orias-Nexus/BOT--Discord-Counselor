#!/bin/bash

# ==========================================================================
# FILE: setup-all.sh
# MÔ TẢ: Tự động hóa toàn bộ quá trình deploy Discord Bot & Dashboard
# ==========================================================================

# --- 1. CẤU HÌNH HỆ THỐNG & SWAP (BẮT BUỘC CHO MÁY 1GB RAM) ---
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# --- 2. CÀI ĐẶT CÁC CÔNG CỤ CẦN THIẾT ---
sudo apt update
sudo apt install git redis-server nano dnsutils nginx cron certbot python3-certbot-nginx -y
sudo npm install -g pm2 

# --- 3. TẢI MÃ NGUỒN & CÀI ĐẶT THƯ VIỆN ---
git config --global credential.helper store
git clone https://github.com/Orias-Nexus/JS--Discord-Counselor.git
cd ~/JS--Discord-Counselor
npm run install:all

# --- 4. CẤU HÌNH BIẾN MÔI TRƯỜNG ---
# Bước này bắt buộc phải dừng lại để ông điền Token thủ công
cp backend/.env.example backend/.env
cp directive/.env.example directive/.env
echo "Dừng lại 1 chút! Hãy điền Token vào các file .env sau đó tiếp tục nhé."
# nano backend/.env
# nano directive/.env

# --- 5. KHỞI TẠO DATABASE & SLASH COMMANDS ---
npm run prisma:generate:backend
npm run deploy:directive

# --- 6. CẤU HÌNH SSL (HTTPS) ---
# Thay đổi tên miền của ông vào đây
sudo certbot --nginx -d orias-counselor.duckdns.org --non-interactive --agree-tos -m bot123azc@gmail.com --redirect

# --- 7. TRIỂN KHAI FRONTEND (HTTPS MODE) ---
# Tự động sửa link API sang https trước khi build
sed -i 's|http://orias-counselor.duckdns.org:4000/api|https://orias-counselor.duckdns.org:4000/api|g' ~/JS--Discord-Counselor/frontend/src/utils/api.js

cd ~/JS--Discord-Counselor/frontend
npm run build
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx

# --- 8. TRIỂN KHAI BACKEND & BOT BẰNG PM2 ---
cd ~/JS--Discord-Counselor
pm2 start npm --name "discord-backend" -- run start:backend
pm2 start npm --name "discord-bot" -- run start:directive
pm2 save
# sudo pm2 startup # Lệnh này ông phải tự chạy theo hướng dẫn của nó hiện ra

# --- 9. TẠO SCRIPT AUTOPULL TỰ ĐỘNG ---
cat << 'EOF' > ~/JS--Discord-Counselor/autopull.sh
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
EOF
chmod +x ~/JS--Discord-Counselor/autopull.sh

# --- 10. THÊM PHÍM TẮT VÀO .BASHRC ---
echo 'alias jdcrs="pm2 flush && rm -rf ~/JS--Discord-Counselor/private/logs/* && pm2 restart all && sudo systemctl restart nginx && pm2 logs discord-bot"' >> ~/.bashrc
source ~/.bashrc

echo "===================================================="
echo "HỆ THỐNG ĐÃ SẴN SÀNG! ĐÃ CÀI ĐẶT XONG HTTPS VÀ AUTOPULL."
echo "===================================================="

# === CÁC LỆNH KIỂM TRA (CHỈ CHẠY KHI CẦN) ===
# 1. Kiểm tra IP máy ảo: # curl ifconfig.me
# 2. Kiểm tra tên miền: # nslookup orias-counselor.duckdns.org
# 3. Kiểm tra gia hạn SSL: # sudo certbot renew --dry-run
# 4. Xem log autopull: # tail -F ~/autopull.log
# 5. Xem log PM2: # pm2 logs discord-bot
# 6. Kiểm tra status PM2: # pm2 status
# 7. Kiểm tra Nginx config: # sudo nginx -t