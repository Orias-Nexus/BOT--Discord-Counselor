# === 1. CẤU HÌNH HỆ THỐNG & SWAP - BẮT BUỘC CHO MÁY 1GB RAM ===
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# === 2. CÀI ĐẶT CÁC CÔNG CỤ CẦN THIẾT ===
sudo apt update
sudo apt install git redis-server nano dnsutils nginx -y
sudo npm install -g pm2  # Cài đặt trình quản lý quy trình Node.js

# === 3. TẢI MÃ NGUỒN & CÀI ĐẶT THƯ VIỆN ===
# Sử dụng Personal Access Token (PAT) làm mật khẩu khi clone
git config --global credential.helper store # Lưu thông tin đăng nhập git
git clone https://github.com/Orias-Nexus/JS--Discord-Counselor.git
cd JS--Discord-Counselor
npm run install:all # Cài đặt toàn bộ dependencies cho 3 folder

# === 4. CẤU HÌNH BIẾN MÔI TRƯỜNG ===
# Bạn cần điền DATABASE_URL, DISCORD_TOKEN, CLIENT_ID và REDIS_URL=redis://127.0.0.1:6379
cp backend/.env.example backend/.env && nano backend/.env
cp directive/.env.example directive/.env && nano directive/.env

# === 5. KHỞI TẠO DATABASE & SLASH COMMANDS ===
npm run prisma:generate:backend # Tạo Prisma Client
npm run deploy:directive         # Đăng ký Slash Commands với Discord

# === 6. TRIỂN KHAI BACKEND & BOT BẰNG PM2 ===
pm2 start npm --name "discord-backend" -- run start:backend
pm2 start npm --name "discord-bot" -- run start:directive
pm2 save # Lưu danh sách để tự khởi động cùng hệ thống
# Chạy lệnh sudo pm2 startup hiện ra trên màn hình của bạn để hoàn tất

# === 7. TRIỂN KHAI FRONTEND ===
cd frontend
npm run build # Đóng gói mã nguồn React
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# Cấu hình Nginx - Sửa server_name và try_files $uri $uri/ /index.html;
sudo nano /etc/nginx/sites-available/default
sudo systemctl restart nginx

# === 8. CẬP NHẬT TÊN MIỀN DUCKDNS ===
# Thay TOKEN và TEN_MIEN bằng thông tin của bạn
curl "https://www.duckdns.org/update?domains=orias-counselor&token=TOKEN&ip=$(curl -s ifconfig.me)"

# === 9. PHÍM TẮT BẢO TRÌ (ALIAS JDC RS) ===
# Thêm vào cuối file ~/.bashrc
lias jdcrs="pm2 flush && rm -rf ~/JS--Discord-Counselor/private/logs/* && pm2 restart all && pm2 logs discord-bot"
# Sau đó chạy: jdcrs