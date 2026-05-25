#!/usr/bin/env bash
# ============================================================
#  AmplifAI — redeploy script
#  SSH into the VPS, cd to /var/www/amplifai, then run:
#    bash scripts/deploy.sh
# ============================================================
set -euo pipefail

APP_DIR="/var/www/amplifai"
cd "$APP_DIR"

echo "==> [1/4] Pull latest code"
git pull --ff-only

echo "==> [2/4] Install dependencies"
# Uses npm install because the repo has no committed lock file.
# Once you run this once on the VPS a package-lock.json will be generated —
# commit it to the repo so future deploys can use `npm ci` for reproducibility.
npm install --include=dev

echo "==> [3/4] Build Nuxt"
NODE_ENV=production npm run build

echo "==> [4/4] Restart PM2"
if pm2 list | grep -q "amplifai"; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
  pm2 save
fi

echo ""
echo "  Deploy complete. App is running on 127.0.0.1:8111"
echo "  Check logs:  pm2 logs amplifai --lines 50"
echo "  Check status: pm2 status"
