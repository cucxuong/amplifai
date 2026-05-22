# Complete Testing Flow - Admin to AmplifAI

## 🎯 Objective

Test the **complete flow** from Admin Dashboard → Backend API → AmplifAI Frontend with mock SSO, without needing Azure AD.

```
[Admin Dashboard]
      ↓
[Backend API - Minisite]
      ↓
[Frontend - AmplifAI]
   ↓ (Mock SSO)
[Logged-in User]
```

---

## 📋 Prerequisites

- Both `minisite` and `amplifai` cloned locally
- Node.js installed
- Backend API running: `https://minisite-roan.vercel.app`

---

## 🚀 Full Flow Setup (15 minutes)

### Phase 1: Start Backend (Minisite)

**Terminal 1:**
```bash
cd minisite

# Install dependencies
npm install

# Seed test data (sessions, products, etc.)
npm run seed

# Start server on port 3001
npm run dev:3001
```

**Verify:**
```bash
curl http://localhost:3001/api/public/sessions
# Should return: { success: true, data: [...sessions...] }
```

---

### Phase 2: Configure Frontend (AmplifAI)

**Update `.env.local` to use local backend:**

```bash
cd amplifai

# Create/update .env.local
cat > .env.local << 'EOF'
NUXT_AUTH_BYPASS=true
NUXT_MINISITE_API_BASE=http://localhost:3001
EOF

# Or manually add:
# NUXT_AUTH_BYPASS=true
# NUXT_MINISITE_API_BASE=http://localhost:3001
```

---

### Phase 3: Start Frontend (AmplifAI)

**Terminal 2:**
```bash
cd amplifai

# Install dependencies
npm install

# Start dev server
npm run dev:http
```

**Output:**
```
 ➜  Local:    http://localhost:3000/
 ➜  Network:  https://192.168.1.x:3000/
```

---

## 🧪 Test Scenarios

### Test 1: User Sign-In Flow

**Expected:** User signs in without Azure AD, gets session

**Steps:**
1. Open `http://localhost:3000/sign-in`
2. Click **"Sign in with Microsoft"**
3. Wait 1-2 seconds...
4. ✅ Redirected to `/` (dashboard)
5. ✅ Username visible: "Dev User"

**What happens behind the scenes:**
```
Browser POST /api/auth/dev-session
    ↓
Server creates session with mock user
    ↓
Session stored in HttpOnly cookie
    ↓
Browser redirected to /
```

---

### Test 2: User Profile Flow

**Expected:** User profile loaded from backend

**Steps:**
1. Already signed in from Test 1
2. Browser DevTools → Network tab
3. Refresh page
4. Watch network requests:
   ```
   GET /api/minisite/me → Backend: GET /api/me
   ```
5. ✅ User profile displays in header
6. ✅ Email: `dev.user@loreal.com`
7. ✅ Name: `Dev User`

**What's tested:**
- Session persistence across page reload
- Server proxying to backend
- Token injection (auth middleware)
- User data parsing

---

### Test 3: Onboarding Flow

**Expected:** First-time users see onboarding, can select persona

**Steps:**
1. Sign in as mock user (if not already)
2. ✅ See onboarding screen
3. Select persona: **"Innovator"** (or any)
4. Click **"Continue"**
5. Watch network: `POST /api/user/onboarding`
6. ✅ Redirected to dashboard
7. ✅ No onboarding on next login

**What's tested:**
- Onboarding component rendering
- Persona selection
- Profile update API call
- Session refresh after profile change

---

### Test 4: Leaderboard

**Expected:** See all users ranked by sparks (mock user at bottom initially)

**Steps:**
1. Navigate to `/leaderboard`
2. ✅ Leaderboard loads
3. ✅ List of users displayed
4. ✅ Your mock user visible (0 sparks initially)
5. Watch network: `GET /api/minisite/leaderboard`

**Backend endpoint:**
```
GET /api/minisite/leaderboard
→ Server calls /api/public/leaderboard
→ No auth required
```

---

### Test 5: Sessions/Agenda

**Expected:** All event sessions displayed

**Steps:**
1. Navigate to `/sessions` or `/agenda`
2. ✅ Sessions load
3. ✅ See seeded sessions from `npm run seed`
4. Sessions include:
   - Keynotes
   - Masterclasses
   - Panels
   - Workshops
   - Networking
5. Can add/remove from schedule
6. Watch storage: Local user schedule stored

**What's tested:**
- Public API (no auth)
- Session list parsing
- Client-side schedule state management

---

### Test 6: QR Check-In (Sparks Reward)

**Expected:** Scanning QR awards sparks

**Steps:**

#### Option A: Simulate via Dev Console
```javascript
// In browser console
fetch('/api/minisite/check-in', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'sess-demo-1',
    campaignId: 'camp-1',
    value: 100
  })
}).then(r => r.json()).then(d => {
  console.log('Check-in result:', d);
  console.log('Sparks awarded:', d.data?.sparksAwarded);
})
```

#### Option B: Test with QR Scanner
```bash
1. Open AmplifAI
2. Find QR scanner page (or Camera icon)
3. Generate test QR from minisite admin:
   curl http://localhost:3001/api/admin/qr-codes
4. Scan with AmplifAI camera
5. See sparks awarded
```

**What happens:**
```
AmplifAI → POST /api/minisite/check-in
    ↓
Server validates user session
    ↓
Server calls minisite: POST /api/check-in
    ↓
Minisite awards sparks to user
    ↓
Returns { sparksAwarded: 100, newBalance: 100 }
    ↓
AmplifAI updates UI
```

**Verify in Minisite Admin:**
- Open `http://localhost:3001/admin`
- Check-in recorded in dashboard stats
- User sparks balance updated

---

### Test 7: Product Redemption (Orders)

**Expected:** User can redeem sparks for products

**Steps:**
1. Sign in and earn sparks (from check-in test)
2. Navigate to **"Gift Shop"** or `/products`
3. ✅ Products loaded
4. ✅ Products have spark costs
5. Click **"Redeem"** on any product
6. Watch network: `POST /api/minisite/orders/redeem`
7. ✅ Success message
8. ✅ Sparks balance decreased
9. ✅ Order created (status: pending/completed)

**Verify in Admin:**
- Go to minisite admin `/admin/orders`
- New order visible with "pending pickup" status

---

### Test 8: Admin Dashboard

**Expected:** Admin sees live stats and user activity

**Steps:**
1. Open minisite admin: `http://localhost:3001/admin`
2. Login (if required)
3. Dashboard shows:
   - **Total Participants** — Should show your mock user
   - **Check-Ins Today** — Your recent check-ins
   - **Sparks Circulating** — Total sparks you earned
   - **Orders to Redeem** — Your pending redemptions
   - **Sparks Activity Chart** — Your check-ins by day
   - **Top Sessions** — Sessions you checked into

**What's tested:**
- Backend stats aggregation
- Real-time data updates
- Admin can see frontend user activity

---

### Test 9: Multiple Users

**Expected:** Different users don't interfere with each other

**Steps:**
1. Open `/dev/sso-test` (development panel)
2. Sign in as **"Innovator"** (`innovator.test@loreal.com`)
3. Earn sparks, check leaderboard
4. Logout
5. Switch user: Sign in as **"Explorer"** (`explorer.test@loreal.com`)
6. Different profile, different sparks balance
7. View leaderboard: See both users ranked

**Backend verification:**
```bash
# Check both users exist
curl http://localhost:3001/api/public/leaderboard | jq '.data[] | {email, sparks}'
```

---

### Test 10: Session Persistence

**Expected:** Session survives page refresh

**Steps:**
1. Sign in as mock user
2. Note the sparks balance (e.g., 100)
3. Refresh page (`Ctrl+R`)
4. ✅ Still logged in
5. ✅ Same sparks balance
6. ✅ No re-login required

**What's tested:**
- Session cookie persistence
- Server session validation
- Client-side session state

---

## 🔄 Full Testing Cycle (Start to Finish)

```
1. Start minisite (npm run dev:3001)
   ↓
2. Start amplifai (npm run dev:http)
   ↓
3. Sign in → See "Dev User"
   ↓
4. Complete onboarding → Select persona
   ↓
5. View agenda → See sessions
   ↓
6. Simulate QR check-in → Earn sparks
   ↓
7. View leaderboard → See ranking
   ↓
8. Redeem sparks → Create order
   ↓
9. Check minisite admin → See all activity
   ↓
10. Switch users → Test isolation
   ↓
✅ Full flow verified!
```

**Time: ~15 minutes**

---

## 📊 Verification Checklist

| Feature | Test | Status |
|---------|------|--------|
| Mock SSO | Click button → Instant login | ✅ |
| User Profile | Profile loads from backend | ✅ |
| Onboarding | Persona selection | ✅ |
| Leaderboard | See users ranked | ✅ |
| Sessions | Agenda loads | ✅ |
| Check-In | QR scan awards sparks | ✅ |
| Orders | Redeem sparks | ✅ |
| Admin Stats | Backend sees activity | ✅ |
| Multi-user | Different sessions isolated | ✅ |
| Persistence | Session survives refresh | ✅ |

---

## 🛠️ Advanced Testing

### A/B Testing Different Backend Versions

```bash
# Test against production
NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app \
npm run dev:http

# Test against staging
NUXT_MINISITE_API_BASE=https://minisite-staging.vercel.app \
npm run dev:http
```

### Performance Testing

```bash
# Monitor network tab for slow requests
1. Open DevTools → Performance tab
2. Reload page
3. Check request times:
   - Sign-in: <500ms
   - Profile: <1s
   - Leaderboard: <2s
```

### Error Scenario Testing

**Simulate backend down:**
```bash
1. Stop minisite (Ctrl+C)
2. Try to load profile
3. ✅ Should show error gracefully
4. Restart minisite
5. ✅ Auto-recovers
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Sign-in is not configured" | `NUXT_AUTH_BYPASS` not enabled | Add to `.env.local` |
| Cannot reach backend | Wrong `NUXT_MINISITE_API_BASE` | Set to `http://localhost:3001` |
| 404 on `/dev/sso-test` | Only in dev mode | Ensure `npm run dev` not production build |
| Sparks not awarded | Session not sent to backend | Check Authorization header in Network tab |
| Leaderboard empty | Backend not seeded | Run `npm run seed` on minisite |
| Admin stats wrong | Old test data | Clear MongoDB and reseed |

---

## 📚 Documentation

- **[MOCK_SSO_SETUP_QUICK_START.md](./MOCK_SSO_SETUP_QUICK_START.md)** — Quick setup (2 min)
- **[MOCK_SSO_TESTING_GUIDE.md](./MOCK_SSO_TESTING_GUIDE.md)** — Detailed testing guide
- **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** — Backend integration details
- **[ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)** — System architecture

---

## 🎬 Next Steps

1. ✅ Follow Quick Start above
2. ✅ Run through all 10 tests
3. ✅ Verify checklist
4. 📝 Document any issues found
5. 🚀 Ready for development!

---

## 💡 Pro Tips

- **Dev Testing Panel:** Visit `/dev/sso-test` for instant user switching
- **Auto-reload:** Changes to `.env.local` require `npm run dev:http` restart
- **Browser DevTools:** Use Network tab to monitor all API calls
- **Backend logs:** Watch minisite terminal for API call logs
- **Seed often:** Run `npm run seed` to reset test data between tests

---

## Summary

You now have a **complete mock testing environment** that simulates:
- ✅ Azure AD sign-in (without Azure AD)
- ✅ User session management
- ✅ Admin dashboard
- ✅ QR scanning & sparks rewards
- ✅ Product redemption
- ✅ Multi-user isolation
- ✅ Real backend API calls

**You can test the entire application flow without Azure AD or production infrastructure!** 🎉
