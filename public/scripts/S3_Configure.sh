#!/bin/bash
BOT_PROJ="${BOT_PROJ:-$HOME/BOT--Discord-Counselor}"

echo "===================================================================="
echo "Starting Server Configuration"
echo "===================================================================="

echo -e "\n[1/7] Configuring Swap Memory..."
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo -e "\n[2/7] Installing PM2..."
sudo npm install -g pm2 

echo -e "\n[3/7] Setting up .env Templates..."
cd $BOT_PROJ
if [ ! -f "backend/.env" ]; then cp backend/.env.example backend/.env; fi
if [ ! -f "directive/.env" ]; then cp directive/.env.example directive/.env; fi

echo -e "\n[4/7] Installing Dependencies and Generating Database..."
cd $BOT_PROJ
cd backend && npm ci --omit=dev && cd ..
cd directive && npm ci --omit=dev && cd ..
cd backend
npx prisma@5 generate
cd ..

echo -e "\n[5/7] Configuring Nginx..."
sudo bash -c "cat > /etc/nginx/sites-available/default <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    server_name orias-counselor.duckdns.org;
    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }
}
EOF"
sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
sudo rm -rf /var/www/html/*
if [ -d "$BOT_PROJ/frontend/dist" ]; then
    sudo cp -r $BOT_PROJ/frontend/dist/* /var/www/html/
fi
sudo systemctl restart nginx

echo -e "\n[6/7] Requesting SSL Certificate (Certbot)..."
sudo certbot --nginx -d orias-counselor.duckdns.org --non-interactive --agree-tos -m bot123azc@gmail.com --redirect

echo -e "\n[7/7] Starting PM2 Services..."
cd $BOT_PROJ
pm2 list | grep "discord-backend" || pm2 start npm --name "discord-backend" --node-args="--max-old-space-size=256" -- run start:backend
pm2 list | grep "discord-bot" || pm2 start npm --name "discord-bot" --node-args="--max-old-space-size=256" -- run start:directive
pm2 restart all
pm2 save

echo -e "\n=> Applying .bashrc aliases..."
if ! grep -q "alias bot=" ~/.bashrc; then
    echo "alias bot=\"cd $BOT_PROJ\"" >> ~/.bashrc
    echo "alias jdcrs=\"pm2 flush && rm -rf $BOT_PROJ/private/logs/* && pm2 restart all && sudo systemctl restart nginx && pm2 logs discord-bot\"" >> ~/.bashrc
fi

echo "===================================================================="
echo "Configuration Complete."
echo "===================================================================="