#!/bin/bash
BOT_PROJ="${BOT_PROJ:-$HOME/BOT--Discord-Counselor}"

if ! grep -q "BOT_PROJ=" ~/.bashrc; then
    echo "export BOT_PROJ=\"$BOT_PROJ\"" >> ~/.bashrc
fi

mkdir -p $BOT_PROJ/public/scripts
cat << 'EOF' > $BOT_PROJ/public/scripts/aptinstall.sh
#!/bin/bash

sudo apt update
sudo apt install rsync git redis-server nano dnsutils nginx cron certbot python3-certbot-nginx -y

sudo systemctl enable redis-server
sudo systemctl enable nginx
sudo systemctl enable cron
sudo systemctl start redis-server
sudo systemctl start nginx
sudo systemctl start cron

echo "-----------------------------------------------"
echo "Installation complete."
echo "-----------------------------------------------"
EOF

chmod +x $BOT_PROJ/public/scripts/aptinstall.sh
echo "Installation Script generated at: $BOT_PROJ/public/scripts/aptinstall.sh"
echo "Run using command: bash $BOT_PROJ/public/scripts/aptinstall.sh"