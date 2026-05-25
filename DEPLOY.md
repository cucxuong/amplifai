# AmplifAI — VPS Deployment Guide

Stack: **Nuxt 4 (Nitro Node server) → PM2 → Nginx → Let's Encrypt**

---

## Prerequisites

- A VPS running **Ubuntu 22.04 or 24.04** (or Debian 12)
- Root/sudo SSH access
- A domain pointed at the VPS IP (A record)
- Your repo pushed to a Git remote (GitHub, GitLab, etc.)

---

## Step 1 — First-time server setup

SSH into the VPS as root and run the setup script:

```bash
bash <(curl -sL https://raw.githubusercontent.com/YOUR_ORG/amplifai/main/scripts/setup-vps.sh)
```

Or copy `scripts/setup-vps.sh` to the server and run it directly:

```bash
scp scripts/setup-vps.sh root@YOUR_VPS_IP:/tmp/
ssh root@YOUR_VPS_IP "bash /tmp/setup-vps.sh"
```

This installs: Node.js 24, npm, PM2, Nginx, Certbot, UFW.

---

## Step 2 — Clone the repo

```bash
sudo -u amplifai git clone git@github.com:YOUR_ORG/amplifai.git /var/www/amplifai
```

If using HTTPS instead of SSH:

```bash
sudo -u amplifai git clone https://github.com/YOUR_ORG/amplifai.git /var/www/amplifai
```

---

## Step 3 — Create the .env file

```bash
cd /var/www/amplifai
cp .env.example .env
nano .env   # or vim .env
```

Minimum required variables for production:

```env
# Required — generate with: openssl rand -base64 32
NUXT_SESSION_PASSWORD=your-super-secret-random-string-min-32-chars

# Auth bypass — set to false in production so real auth is enforced
NUXT_AUTH_BYPASS=false

# Session cookie must be secure in production (HTTPS)
NUXT_SESSION_COOKIE_SECURE=true

# If you have a minisite API backend:
NUXT_MINISITE_API_BASE=https://your-minisite-url.vercel.app
NUXT_MINISITE_PUBLIC_API_KEY=

# SAML (leave blank if not configured yet)
NUXT_SAML_ENTITY_ID=https://your-domain.com
NUXT_SAML_ACS_URL=https://your-domain.com/api/auth/saml/acs
NUXT_SAML_IDP_SSO_URL=
NUXT_SAML_IDP_CERT=
```

---

## Step 4 — First deploy

```bash
cd /var/www/amplifai
sudo -u amplifai bash scripts/deploy.sh
```

This runs `npm ci`, `nuxt build`, and starts the app under PM2.

Verify it's up:

```bash
pm2 status
pm2 logs amplifai --lines 30
curl http://127.0.0.1:8111   # should return HTML
```

---

## Step 5 — Configure Nginx

```bash
# Copy config and replace YOUR_DOMAIN
cp /var/www/amplifai/scripts/nginx.conf /etc/nginx/sites-available/amplifai
nano /etc/nginx/sites-available/amplifai   # replace YOUR_DOMAIN

# Enable the site
ln -s /etc/nginx/sites-available/amplifai /etc/nginx/sites-enabled/

# Remove default site if present
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
```

---

## Step 6 — SSL with Let's Encrypt

```bash
certbot --nginx -d your-domain.com
```

Certbot will automatically update the Nginx config to redirect HTTP → HTTPS and install the certificate. It also sets up auto-renewal via a systemd timer.

Verify renewal works:

```bash
certbot renew --dry-run
```

---

## Routine deploy (after first setup)

```bash
ssh amplifai@YOUR_VPS_IP
cd /var/www/amplifai
git pull
bash scripts/deploy.sh
```

Or as a one-liner from your local machine:

```bash
ssh amplifai@YOUR_VPS_IP "cd /var/www/amplifai && git pull && bash scripts/deploy.sh"
```

---

## Useful PM2 commands

```bash
pm2 status              # running processes
pm2 logs amplifai       # tail logs
pm2 logs amplifai --lines 100  # last 100 lines
pm2 reload amplifai     # zero-downtime reload
pm2 restart amplifai    # hard restart
pm2 monit               # interactive dashboard
```

---

## Troubleshooting

**App not responding after deploy**
```bash
pm2 logs amplifai --lines 50   # check for startup errors
```
Common causes: missing `.env` variable, `NUXT_SESSION_PASSWORD` too short (needs 32+ chars).

**Nginx 502 Bad Gateway**
The app isn't running or isn't listening on port 3000. Check `pm2 status` and `pm2 logs`.

**SSL certificate errors**
Make sure your domain's A record points to the VPS before running certbot.

**Lock file best practice**
After the first deploy, a `package-lock.json` will be generated on the server. Copy it back to your local repo and commit it:
```bash
scp amplifai@YOUR_VPS_IP:/var/www/amplifai/package-lock.json .
git add package-lock.json && git commit -m "chore: add package-lock.json"
```
Once it's committed you can change `npm install --include=dev` in `deploy.sh` to `npm ci --prefer-offline` for faster, reproducible installs.

---

## Files added by this guide

| File | Purpose |
|------|---------|
| `scripts/setup-vps.sh` | One-time server provisioning |
| `scripts/deploy.sh` | Redeploy after `git pull` |
| `scripts/nginx.conf` | Nginx reverse proxy config |
| `ecosystem.config.cjs` | PM2 process definition |
| `DEPLOY.md` | This guide |
