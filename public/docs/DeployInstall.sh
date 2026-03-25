cat << 'EOF' > ~/aptinstall.sh
#!/bin/bash

# 1. Cập nhật danh sách gói hệ thống
sudo apt update

# 2. Cài đặt toàn bộ các công cụ đã dùng từ đầu đến giờ:
# git: Tải code từ GitHub
# redis-server: Cơ sở dữ liệu tạm thời cho Bot
# nano: Trình chỉnh sửa file
# dnsutils: Lệnh nslookup để check tên miền
# nginx: Web Server chạy Frontend
# cron: Lập lịch tự động chạy Autopull
# certbot & python3-certbot-nginx: Cấu hình HTTPS/SSL
sudo apt install git redis-server nano dnsutils nginx cron certbot python3-certbot-nginx -y

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
chmod +x ~/aptinstall.sh