#!/bin/bash

# ==========================================================================
# FILE: DeployConfig.sh
# MÔ TẢ: Cấu hình Server VPS lần đầu (áp dụng mô hình Local Build -> Rsync)
# LƯU Ý: Chạy file này TRÊN SERVER sau khi bạn đã cài DeployInstall.sh và 
# rsync mã nguồn lên server lần đầu tiên!
# ==========================================================================

PROJECT_DIR="${PROJECT_DIR:-$HOME/BOT--Discord-Counselor}"

echo "===================================================================="
echo "BẮT ĐẦU CẤU HÌNH VPS (MÔ HÌNH PRE-BUILD / RSYNC)"
echo "===================================================================="

# --- 1. CẤU HÌNH HỆ THỐNG & SWAP (BẮT BUỘC CHO MÁY 1GB RAM) ---
echo -e "\n[1/8] Thiết lập Swap 2GB để chống tràn RAM..."
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# --- 2. CÀI ĐẶT CÁC CÔNG CỤ CẦN THIẾT ---
echo -e "\n[2/8] Cài đặt PM2 (Trình quản lý tiến trình)..."
sudo npm install -g pm2 

# --- 3. CÀI ĐẶT THƯ VIỆN (PRODUCTION) ---
echo -e "\n[3/8] Cài đặt package NodeJS (Chỉ production, bỏ qua qua devDependencies)..."
cd $PROJECT_DIR
# Dùng npm ci --omit=dev để bớt tốn RAM (yêu cầu phải có package-lock.json sinh ra trên Github)
npm ci --omit=dev

# --- 4. CẤU HÌNH BIẾN MÔI TRƯỜNG ---
echo -e "\n[4/8] Cấu hình Token (.env)..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
fi
if [ ! -f "directive/.env" ]; then
    cp directive/.env.example directive/.env
fi
echo "\n⚠️ Dừng lại 1 chút! Hãy điền Token vào các file .env trước khi tiếp tục."
echo "Bạn có thể mở một tab SSH khác và gõ:"
echo "nano $PROJECT_DIR/backend/.env"
echo "nano $PROJECT_DIR/directive/.env"
read -p "Nhấn Enter để tiếp tục cài đặt sau khi đã điền xong..."

# --- 5. KHỞI TẠO DATABASE & SLASH COMMANDS ---
echo -e "\n[5/8] Generate Prisma & Deploy Lệnh Bot..."
npm run prisma:generate:backend
npm run deploy:directive

# --- 6. CẤU HÌNH SSL (HTTPS) ---
# Thay đổi tên miền của bạn vào đây
echo -e "\n[6/8] Cấu hình SSL cho Nginx..."
sudo certbot --nginx -d orias-counselor.duckdns.org --non-interactive --agree-tos -m bot123azc@gmail.com --redirect

# --- 7. TRIỂN KHAI FRONTEND LÊN NGINX ---
echo -e "\n[7/8] Đưa Frontend (đã Pre-build từ Local) lên Web Server..."
# Lưu ý: Thư mục frontend/dist đã được Rsync từ máy tính cá nhân lên rồi.
sudo rm -rf /var/www/html/*
# Kiểm tra nếu thư mục dist tồn tại thì copy
if [ -d "$PROJECT_DIR/frontend/dist" ]; then
    sudo cp -r $PROJECT_DIR/frontend/dist/* /var/www/html/
    sudo systemctl restart nginx
else
    echo "⚠️ Không tìm thấy $PROJECT_DIR/frontend/dist. Có vẻ như bạn chưa chạy rsync thư mục build lên server?"
fi

# --- 8. TRIỂN KHAI BACKEND & BOT BẰNG PM2 (Giới hạn RAM) ---
echo -e "\n[8/8] Khởi động Bot và Backend với PM2 (Giới hạn 256MB RAM)..."
cd $PROJECT_DIR
pm2 start npm --name "discord-backend" --node-args="--max-old-space-size=256" -- run start:backend
pm2 start npm --name "discord-bot" --node-args="--max-old-space-size=256" -- run start:directive
pm2 save
# Tùy chọn: Để bot tự chạy lại khi sập VPS, chạy: 
# sudo pm2 startup

# --- 9. THÊM PHÍM TẮT VÀO .BASHRC ---
echo -e "\n=> Tạo phím tắt cho lệnh update tay..."
# Alias truy cập nhanh bằng lệnh 'bot'
echo "alias bot=\"cd $PROJECT_DIR\"" >> ~/.bashrc
# Alias đơn giản để reset log, nạp lại PM2 (nếu bạn rsynce code mới lên)
echo "alias jdcrs=\"pm2 flush && rm -rf $PROJECT_DIR/private/logs/* && pm2 restart all && sudo systemctl restart nginx && pm2 logs discord-bot\"" >> ~/.bashrc
source ~/.bashrc

echo "===================================================================="
echo "✅ HỆ THỐNG ĐÃ SẴN SÀNG!"
echo "- Lượng RAM đã được tiết kiệm tối đa (chạy bằng Swap nhỏ, loại bỏ build tay)."
echo "- Bạn không cần sửa file DeployConfig này nữa. Mỗi khi sửa code, bạn chỉ cần dùng script Local Rsync từ máy cá nhân đẩy code thẳng lên!"
echo "===================================================================="

# === CÁC LỆNH KIỂM TRA (CHỈ CHẠY KHI CẦN) ===
# 1. Kiểm tra IP máy ảo: # curl ifconfig.me
# 2. Kiểm tra tên miền: # nslookup orias-counselor.duckdns.org
# 3. Xem log PM2: # pm2 logs discord-bot
# 4. Kiểm tra status PM2: # pm2 status
# 5. Kiểm tra Nginx config: # sudo nginx -t