#!/usr/bin/env bash
# ============================================================
#  AmplifAI — VPS first-time setup
#  Tested on Ubuntu 22.04 / 24.04 and Debian 12
#  Run as root (or with sudo) on a fresh server
# ============================================================
set -euo pipefail

APP_USER="amplifai"          # system user that will run the app
NODE_VERSION="24"            # major version — matches .nvmrc
APP_DIR="/var/www/amplifai"  # where the repo lives on the server

echo "==> [1/6] System packages"
apt-get update -y
apt-get install -y \
  curl git nginx certbot python3-certbot-nginx \
  build-essential ca-certificates gnupg ufw

echo "==> [2/6] Node.js $NODE_VERSION (NodeSource)"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
node -v && npm -v

echo "==> [3/6] PM2"
npm install -g pm2
pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" || true

echo "==> [4/6] App system user"
if ! id "$APP_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$APP_USER"
fi
mkdir -p "$APP_DIR"
chown "$APP_USER":"$APP_USER" "$APP_DIR"

echo "==> [5/6] Firewall (UFW)"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

echo "==> [6/6] Done"
echo ""
echo "  Next steps:"
echo "  1. Clone your repo:  sudo -u $APP_USER git clone <your-repo-url> $APP_DIR"
echo "  2. Create .env:      cp $APP_DIR/.env.example $APP_DIR/.env  (then edit it)"
echo "  3. First deploy:     cd $APP_DIR && sudo -u $APP_USER bash scripts/deploy.sh"
echo "  4. Set up Nginx:     cp $APP_DIR/scripts/nginx.conf /etc/nginx/sites-available/amplifai"
echo "                       (edit the server_name), then enable it (see DEPLOY.md)"
echo "  5. SSL:              certbot --nginx -d yourdomain.com"
