#!/bin/bash
# ==========================================================================
# FILE: DeployLocalSync.sh
# MÔ TẢ: Script tự động Build Frontend và đẩy toàn bộ code lên VPS 
# (Chạy script này bẳng Git Bash trên Máy Tính Local / Windows)
# ==========================================================================

# 1. Tùy chỉnh thông tin Server của bạn ở đây:
SERVER_USER="long1"
SERVER_IP="orias-counselor.duckdns.org" # Hoặc nhập IP trực tiếp XXX.XXX.XXX.XXX
SERVER_DIR="${SERVER_DIR:-/home/long1/BOT--Discord-Counselor}"

# Thay bằng đường dẫn file private key của bạn (nếu dùng rsa), có thể là ~/.ssh/id_rsa
# Nếu dùng mật khẩu, hãy bỏ tham số `-i $SSH_KEY` bên dưới đi (hoặc dùng ssh-copy-id)
SSH_KEY="~/.ssh/id_rsa" 

echo "===================================================="
echo "🚀 BẮT ĐẦU QUÁ TRÌNH DEPLOY LÊN SERVER (PRE-BUILD)"
echo "===================================================="

# 2. Build Frontend tại máy local
echo "[1/4] Đang Build Frontend tại Local..."
cd frontend
# Cài đặt thư viện frontend nếu chưa có (lệnh này chạy trên máy Windows)
npm install
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Lỗi khi build Frontend! Dừng quá trình rsync."
  exit 1
fi
cd ..

# 3. Đồng bộ hóa toàn bộ source dự án lên Server (Rsync)
echo "[2/4] Đang chuyển mã nguồn và thư mục Build lên Server..."
# Lệnh rsync bỏ qua node_modules và các thư mục rác không cần thiết để gửi lên cực nhanh.
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.vscode' \
  --exclude 'private/logs' \
  --exclude '*.env' \
  --exclude 'public/docs' \
  -e "ssh -i $SSH_KEY" \
  ./ $SERVER_USER@$SERVER_IP:$SERVER_DIR

# 4. SSH vào Server để chạy lệnh Cập nhật DB và Restart
echo "[3/4] Cập nhật Database, PM2 và Nginx trên Server..."
# Mở một session SSH tạm và truyền các lệnh này vào thực thi ở Ubuntu:
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP << ENDSSH
  cd $SERVER_DIR
  
  # Cài đặt/Cập nhật các package backend phục vụ chạy web server (bỏ qua đồ dev rác)
  echo "=> Chạy cài đặt packages Production..."
  npm ci --omit=dev
  
  # Cập nhật Prisma Schema mới nếu có (Ví dụ bạn có thay đổi Data schema)
  echo "=> Generate Prisma..."
  npm run prisma:generate:backend
  
  # Copy Frontend Dist (mới bắn qua rsync) đưa ra public html 
  echo "=> Refresh bộ nhớ đệm Nginx..."
  sudo rm -rf /var/www/html/*
  sudo cp -r frontend/dist/* /var/www/html/
  sudo systemctl restart nginx
  
  # Khởi động / Nạp lại PM2
  echo "=> Restart tiến trình Node..."
  pm2 flush
  pm2 auto-save
  pm2 restart all
ENDSSH

echo "===================================================="
echo "[4/4] ✅ DEPLOY HOÀN TẤT!"
echo "Server đã được cập nhật thành công siêu nhanh và tốn rất ít RAM."
echo "===================================================="
