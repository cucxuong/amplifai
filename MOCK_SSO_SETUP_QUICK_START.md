# Mock SSO Setup - Quick Start

## 🚀 Get Started in 2 Minutes

### Step 1: Your `.env` is Already Configured ✅

The mock SSO is **already enabled** by default in `.env`:

```bash
NUXT_AUTH_BYPASS=true  # ← Already set
NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app
```

### Step 2: Start the App

```bash
cd amplifai
npm install  # First time only
npm run dev:http
```

### Step 3: Test Login

1. Open browser: `http://localhost:3000/sign-in`
2. Click **"Sign in with Microsoft"**
3. ✅ Automatically signed in as `dev.user@loreal.com`
4. Redirected to dashboard

**That's it! No Azure AD needed.** 🎉

---

## 🧪 Testing Full Flow (With Backend)

### Setup

```bash
# Terminal 1: Start Backend
cd minisite
npm run dev:3001

# Terminal 2: Start Frontend (in same repo)
cd amplifai
npm run dev:http
```

### Test Steps

1. **Sign in**
   - Click "Sign in with Microsoft"
   - See mock user session created

2. **Complete onboarding**
   - Select a persona (Innovator, Explorer, etc.)
   - Click "Continue"

3. **View dashboard**
   - Profile shows your name
   - Sparks balance visible (0 initially)

4. **Scan QR code** (simulate)
   - Open DevTools (F12)
   - Go to Console tab
   - Paste:
     ```javascript
     fetch('/api/minisite/check-in', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         sessionId: 'sess-1',
         campaignId: 'camp-1',
         value: 100
       })
     }).then(r => r.json()).then(console.log)
     ```
   - Should see sparks awarded

5. **Check leaderboard**
   - Navigate to `/leaderboard`
   - See yourself ranked

6. **View sessions**
   - Go to `/sessions` or agenda
   - See event schedule

---

## 👥 Test Different User Scenarios

### Option 1: Use Dev Testing Panel (Easiest)

```bash
npm run dev:http
# Open: http://localhost:3000/dev/sso-test
```

**Features:**
- 5 pre-configured test users (Innovator, Explorer, etc.)
- Custom user creation
- Instant sign-in without Azure AD
- Perfect for UI testing

**Users:**
- 🚀 **dev.user** — Default (no onboarding)
- 💡 **innovator.test** — Innovator persona
- 🔍 **explorer.test** — Explorer persona
- 🤝 **connector.test** — Connector persona
- 🎯 **performer.test** — Performer persona

---

### Option 2: Command Line Testing

```bash
# Create mock session with curl
curl -X POST http://localhost:3000/api/auth/dev-session \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt

# Fetch user profile
curl http://localhost:3000/api/minisite/me \
  -b cookies.txt
```

---

### Option 3: Custom User via API

```bash
# Sign in as custom user
curl -X POST http://localhost:3000/api/auth/dev/mock-saml \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt \
  -d '{
    "email": "jane.doe@loreal.com",
    "firstName": "Jane",
    "lastName": "Doe"
  }'
```

---

## 🔧 Configuration

### Enable/Disable Mock SSO

**Enable (development):**
```bash
# In .env or .env.local
NUXT_AUTH_BYPASS=true
```

**Disable (use real Azure AD):**
```bash
# In .env or set on Vercel dashboard
NUXT_AUTH_BYPASS=false
```

**Auto-behavior:**
- Local dev: Enabled by default (ignore `NUXT_AUTH_BYPASS`)
- Vercel production: Disabled by default

---

### Point to Different Backend

```bash
# Local minisite
NUXT_MINISITE_API_BASE=http://localhost:3001

# Staging
NUXT_MINISITE_API_BASE=https://minisite-staging.vercel.app

# Production
NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app
```

Then restart: `npm run dev:http`

---

## 📋 What's Tested

| Feature | Status | Notes |
|---------|--------|-------|
| Sign-in flow | ✅ Works | Instant with mock SSO |
| Session creation | ✅ Works | No Azure AD needed |
| User profile fetch | ✅ Works | Returns mock user |
| Leaderboard | ✅ Works | Shows rankings |
| Sessions/agenda | ✅ Works | Lists all sessions |
| QR check-in | ✅ Works | Awards sparks |
| Sparks rewards | ✅ Works | Balance updates |
| Orders/redemption | ✅ Works | Redeem sparks for items |
| Onboarding | ✅ Works | Complete persona selection |
| Logout | ✅ Works | Clears session |

---

## 🎯 Common Testing Scenarios

### Scenario 1: Test Onboarding Flow
```bash
1. Sign in with dev user
2. See onboarding screen
3. Select persona → "Continue"
4. Redirected to dashboard
5. Onboarding not shown again on logout/login
```

### Scenario 2: Test QR Scanning
```bash
1. Sign in
2. Navigate to QR scanner
3. Scan test QR or simulate JSON:
   {"sessionId":"sess-1","campaignId":"camp-1","value":100}
4. See sparks awarded in UI
5. Sparks balance updates
6. Admin sees check-in recorded
```

### Scenario 3: Test Leaderboard
```bash
1. Sign in as multiple users (use dev/sso-test)
2. Each does check-ins with different sparks
3. View leaderboard
4. Rankings updated correctly
```

### Scenario 4: Test Admin Dashboard (Minisite)
```bash
1. Start minisite: npm run dev:3001
2. Check-in as mock user from amplifai
3. Go to minisite admin
4. See new user in admin dashboard
5. See check-in recorded in stats
6. See sparks awarded in user profile
```

---

## 🐛 Troubleshooting

### Problem: "Sign in is not configured yet"

**Cause:** Mock SSO not enabled

**Fix:**
```bash
echo "NUXT_AUTH_BYPASS=true" >> .env.local
npm run dev:http
```

### Problem: Clicking button redirects to Azure AD login

**Cause:** `NUXT_AUTH_BYPASS` set to `false`

**Fix:**
```bash
# Check .env
grep NUXT_AUTH_BYPASS .env

# Should show: NUXT_AUTH_BYPASS=true
# If false, change it

npm run dev:http
```

### Problem: "Minisite session is missing"

**Cause:** Backend not reachable or not running

**Fix:**
```bash
# Terminal 1: Start minisite
cd minisite
npm run dev:3001

# Terminal 2: Check NUXT_MINISITE_API_BASE in amplifai/.env
# Should be: http://localhost:3001
```

### Problem: Can't access `/dev/sso-test`

**Cause:** Page only works in dev mode

**Fix:**
- Ensure you're running `npm run dev:http` (not production build)
- Check URL: `http://localhost:3000/dev/sso-test`

---

## 📚 Related Documentation

- **[MOCK_SSO_TESTING_GUIDE.md](./MOCK_SSO_TESTING_GUIDE.md)** — Detailed testing guide
- **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** — Backend API integration
- **[ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)** — System architecture

---

## 🎬 Next Steps

1. ✅ Already enabled in `.env`
2. ✅ Run `npm run dev:http`
3. ✅ Click "Sign in with Microsoft"
4. ✅ Test features
5. When Azure AD is ready → Set `NUXT_AUTH_BYPASS=false`

---

## 📞 Dev Testing Panel

Quick way to test different users without restarting:

```bash
npm run dev:http
# Open: http://localhost:3000/dev/sso-test
```

- 5 pre-configured personas
- Instant switching between users
- Custom user creation
- See current session info

---

## Summary

| What | How |
|------|-----|
| **Quick test** | `npm run dev:http` → Click sign-in button |
| **Full stack** | Start minisite + amplifai → Test features |
| **Different users** | Visit `/dev/sso-test` → Select user |
| **With real backend** | Change `NUXT_MINISITE_API_BASE` |
| **Disable mock SSO** | Set `NUXT_AUTH_BYPASS=false` |

**You're ready to go! 🚀**
