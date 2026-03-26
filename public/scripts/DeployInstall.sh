# Đọc biến toàn cục (nếu chưa có thì mặc định lấy đường dẫn này)
PROJECT_DIR="${PROJECT_DIR:-$HOME/BOT--Discord-Counselor}"

# Tự động gắn biến này thành biến môi trường toàn cục cho Server
if ! grep -q "PROJECT_DIR=" ~/.bashrc; then
    echo "export PROJECT_DIR=\"$PROJECT_DIR\"" >> ~/.bashrc
fi

mkdir -p $PROJECT_DIR/public/scripts
cat << 'EOF' > $PROJECT_DIR/public/scripts/aptinstall.sh
#!/bin/bash

# 1. Cập nhật danh sách gói hệ thống
sudo apt update

# 2. Cài đặt toàn bộ các công cụ đã dùng từ đầu đến giờ:
# git: Tải code từ GitHub (nếu cần thủ công)
# rsync: Đồng bộ file mã nguồn từ máy tính cá nhân lên
# redis-server: Cơ sở dữ liệu tạm thời cho Bot
# nano: Trình chỉnh sửa file
# dnsutils: Lệnh nslookup để check tên miền
# nginx: Web Server chạy Frontend
# cron: Lập lịch tự động quản lý (nếu có)
# certbot & python3-certbot-nginx: Cấu hình HTTPS/SSL
sudo apt install rsync git redis-server nano dnsutils nginx cron certbot python3-certbot-nginx -y

# 3. Cài đặt Node.js và NPM (nếu máy mới hoàn toàn chưa có)
# sudo apt install nodejs npm -y

# 4. Kích hoạt các dịch vụ vừa cài
sudo systemctl enable redis-server
sudo systemctl enable nginx
sudo systemctl enable cron
sudo systemctl start redis-server
sudo systemctl start nginx
sudo systemctl start cron

echo "-----------------------------------------------"
echo "XONG! Tất cả các gói cần thiết đã được cài đặt."
echo "-----------------------------------------------"
EOF

# Cấp quyền thực thi cho file
chmod +x $PROJECT_DIR/public/scripts/aptinstall.sh
echo "File cài đặt đã được tạo tại: $PROJECT_DIR/public/scripts/aptinstall.sh"
echo "Bạn có thể chạy nó ngay bằng lệnh:"
echo "bash $PROJECT_DIR/public/scripts/aptinstall.sh"