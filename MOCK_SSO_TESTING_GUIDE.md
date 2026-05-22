# Mock SSO Testing Guide

## Overview

AmplifAI includes a built-in mock SAML SSO system for testing without Azure AD. It creates a test user and establishes a session automatically.

---

## Quick Start (30 seconds)

### 1. Enable Mock SSO

Add to `.env.local`:
```bash
NUXT_AUTH_BYPASS=true
NUXT_MINISITE_API_BASE=http://localhost:3001  # Or your minisite URL
```

### 2. Restart Dev Server
```bash
npm run dev:http
# or
npm run dev
```

### 3. Click "Sign in with Microsoft"
- The button will automatically create a mock user session
- You'll be redirected to dashboard as `dev.user@loreal.com`

**That's it! ✅**

---

## How It Works

### Architecture

```
User clicks "Sign in with Microsoft"
            ↓
SignIn.vue calls POST /api/auth/dev-session
            ↓
Dev session endpoint checks: Is NUXT_AUTH_BYPASS enabled?
            ├─ YES → Create mock user + session → Redirect to /
            └─ NO  → Return 403 → Fall back to real SAML /api/auth/saml/login
```

### Mock User Details

**Email:** `dev.user@loreal.com`  
**Name:** `Dev User`  
**SSO ID:** `dev-mock-oid`  
**Auth Provider:** `saml`  
**Onboarding:** Incomplete (you'll see onboarding flow on first login)

---

## Configuration

### Enable/Disable Mock SSO

**For Development (default):**
```bash
# .env or .env.local — unset or true = enabled
NUXT_AUTH_BYPASS=true
```

**For Production:**
```bash
# Vercel Dashboard → Settings → Environment Variables
NUXT_AUTH_BYPASS=false
```

**Auto-Behavior:**
- Local dev (`npm run dev`): Enabled by default
- Vercel production: Disabled by default
- Can be overridden in `.env` or Vercel dashboard

### Environment Variables

**File:** `.env.local`

```bash
# Mock SSO (dev only)
NUXT_AUTH_BYPASS=true

# Backend URL (must match your minisite)
NUXT_MINISITE_API_BASE=http://localhost:3001
# OR for Vercel:
# NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app

# Optional: Mock SAML certificate for testing SAML flow
NUXT_SAML_IDP_CERT=
NUXT_SAML_IDP_SSO_URL=
```

---

## Testing Workflows

### Workflow 1: Quick Session Test (No Backend Needed)

**Goal:** Test AmplifAI UI without backend

**Setup:**
```bash
# Terminal: Start AmplifAI only
cd amplifai
NUXT_AUTH_BYPASS=true npm run dev:http
```

**Test:**
1. Open `http://localhost:3000/sign-in`
2. Click "Sign in with Microsoft"
3. Redirected to `/` (dashboard will show empty state)
4. User info visible in header: `Dev User`

**What's tested:**
- ✅ Sign-in flow
- ✅ Session creation
- ✅ Route protection (can't access protected routes before login)
- ✅ Logout functionality

---

### Workflow 2: Full Stack Test (AmplifAI + Minisite)

**Goal:** Test complete flow from AmplifAI → Minisite → back

**Setup:**
```bash
# Terminal 1: Start Minisite
cd minisite
npm run dev:3001

# Terminal 2: Start AmplifAI
cd amplifai
NUXT_AUTH_BYPASS=true \
NUXT_MINISITE_API_BASE=http://localhost:3001 \
npm run dev:http
```

**Test:**
1. Open `http://localhost:3000/sign-in`
2. Click "Sign in with Microsoft"
3. Redirected to dashboard
4. Check user profile loads:
   ```
   GET http://localhost:3000/api/minisite/me
   → Backend calls http://localhost:3001/api/me
   ```
5. Check leaderboard loads:
   ```
   GET http://localhost:3000/api/minisite/leaderboard
   → Backend calls http://localhost:3001/api/public/leaderboard
   ```
6. Test QR check-in:
   - Open dev tools → Network tab
   - Click "Scan QR Code"
   - Scan or simulate: `{"sessionId":"sess-1","campaignId":"camp-1","value":100}`
   - Watch `POST /api/minisite/check-in` call

**What's tested:**
- ✅ SSO → Token exchange → Session
- ✅ API proxying (server routes → minisite)
- ✅ User profile fetching
- ✅ Public endpoints (leaderboard, sessions)
- ✅ Protected endpoints (check-in, orders)
- ✅ Real sparks rewards flow

---

### Workflow 3: Admin Testing

**Goal:** Test admin dashboard + user creation flow

**Setup:**
```bash
# Terminal 1: Minisite seed data + start
cd minisite
npm run seed              # Creates test sessions, products
npm run dev:3001

# Terminal 2: AmplifAI with mock SSO
cd amplifai
NUXT_AUTH_BYPASS=true \
NUXT_MINISITE_API_BASE=http://localhost:3001 \
npm run dev:http
```

**Test:**
1. Sign in as mock user (`dev.user@loreal.com`)
2. Navigate to dashboard → complete onboarding
3. View sessions in agenda
4. Scan QR codes (generate from minisite admin)
5. Redeem sparks in gift shop
6. Check leaderboard ranking

**Expected Results:**
- ✅ Mock user appears in minisite admin
- ✅ Check-ins recorded in admin dashboard
- ✅ Sparks balance updates in real-time
- ✅ Leaderboard shows mock user ranking

---

## Testing Different User States

### Test Onboarding Flow

**Step 1:** First login as mock user
```bash
NUXT_AUTH_BYPASS=true npm run dev:http
# Sign in → See onboarding screen
```

**Step 2:** Complete onboarding
```
Select Persona (Innovator, Explorer, Connector, Performer)
→ POST /api/user/onboarding
→ Redirect to dashboard
```

**Step 3:** Second login (onboarding skipped)
```
Sign in → Skip onboarding → Go straight to dashboard
```

---

### Test Protected Routes

**Setup:**
```bash
NUXT_AUTH_BYPASS=true npm run dev:http
```

**Test:**
1. Navigate to `/dashboard` without signing in
   - Should redirect to `/sign-in`

2. Sign in
   - Should load dashboard

3. Call `$fetch('/api/minisite/me')` without token
   - Server returns 401
   - Middleware redirects to login

---

### Test Error States

**Simulate backend error:**
```typescript
// In a page component during testing
const result = await $fetch('/api/minisite/me').catch(err => {
  console.error('API Error:', err.statusCode, err.message)
  // Expected: proper error handling
})
```

---

## Creating Custom Mock Users

### Modify Mock User Data

**File:** `server/services/auth/sso.service.ts`

```typescript
export async function findOrCreateDevMockUser(): Promise<StoredUser> {
  const email = 'dev.user@loreal.com'  // ← Change here
  
  const user: StoredUser = {
    email,
    firstName: 'Dev',      // ← Change here
    lastName: 'User',      // ← Change here
    emailVerified: true,
    onboardingComplete: false,  // ← Set to true to skip onboarding
    personaId: null,       // ← Set to 'innovator' etc
    createdAt: Date.now(),
    authProvider: 'saml',
    ssoSubjectId: 'dev-mock-oid',
  }
  
  await saveUser(user)
  return user
}
```

**After editing, restart:**
```bash
npm run dev:http
```

### Custom User Persona

To test with a completed profile:

```typescript
export async function findOrCreateDevMockUser(): Promise<StoredUser> {
  // ... 
  const user: StoredUser = {
    email: 'dev.user@loreal.com',
    firstName: 'Jane',
    lastName: 'Innovator',
    emailVerified: true,
    onboardingComplete: true,    // ← Skip onboarding
    personaId: 'innovator',      // ← Pre-selected persona
    createdAt: Date.now(),
    authProvider: 'saml',
    ssoSubjectId: 'dev-mock-oid',
  }
  
  await saveUser(user)
  return user
}
```

---

## Testing with Real Minisite API (Vercel)

### Use Production Backend in Dev

**Setup:**
```bash
cd amplifai

# Use production backend, local mock SSO
NUXT_AUTH_BYPASS=true \
NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app \
npm run dev:http
```

**Test:**
1. Sign in locally with mock user
2. Backend calls production minisite
3. See real production data (sessions, leaderboard, etc.)
4. Test against live database

**Useful for:**
- Testing against production schema
- Load testing
- Integration testing before deployment

---

## Simulating the Full SAML Flow (Optional)

### What is SAML?

SAML (Security Assertion Markup Language) is XML-based SSO protocol. Azure AD sends signed XML assertion to AmplifAI.

### Current Mock Flow

```
Mock SSO (instant):
Click button → POST /api/auth/dev-session → Create user → Done

Real SAML (3-step):
Click button → Redirect to Azure AD → Authenticate → 
Azure redirects to /api/auth/saml/acs → POST SAML assertion → Done
```

### If You Need SAML Testing

Create a mock SAML assertion file:

**File:** `server/api/auth/saml/mock-acs.post.ts`

```typescript
/**
 * Mock SAML ACS endpoint for testing SAML assertion flow
 * without Azure AD
 */
export default defineEventHandler(async (event) => {
  const isDevMode = import.meta.dev
  
  if (!isDevMode) {
    throw createError({
      statusCode: 404,
      message: 'Mock SAML ACS is only available in development',
    })
  }

  // Simulate SAML response parsing
  const mockProfile = {
    nameID: 'dev-mock-oid',
    email: 'dev.user@loreal.com',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': 'Dev',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': 'User',
  }

  const claims = mapSamlProfileToClaims(mockProfile)
  const stored = await findOrCreateSamlUser(claims)
  const payload = buildUserSessionPayload(stored)
  
  await setUserSession(event, payload)
  return sendRedirect(event, '/')
})
```

Then test:
```bash
# Simulate SAML callback
curl -X POST http://localhost:3000/api/auth/saml/mock-acs \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "SAMLResponse=<xml>"
```

---

## Debugging

### Enable Console Logging

**In AmplifAI:**
```typescript
// composables/useMinisiteAuth.ts
async function fetchMe() {
  if (!loggedIn.value) {
    console.log('[Auth] Not logged in')
    return null
  }
  
  console.log('[Auth] Fetching user profile...')
  const profile = await userStore.fetchMe()
  console.log('[Auth] User profile:', profile)
  return profile
}
```

### Monitor Network Requests

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Sign in
4. Look for:
   - `POST /api/auth/dev-session` (mock login)
   - `GET /api/minisite/me` (profile fetch)
   - `GET /api/minisite/leaderboard` (data loading)

### Check Server Logs

```bash
# Terminal running AmplifAI
npm run dev:http

# Look for logs:
# [100] POST /api/auth/dev-session (mock session created)
# [200] GET /api/minisite/me (proxied to minisite)
```

### Database State

**Check if mock user exists (Minisite):**
```bash
# In minisite MongoDB
db.users.findOne({ email: 'dev.user@loreal.com' })
# Should return user document with ssoSubjectId, personaId, etc.
```

---

## Troubleshooting

### Problem: "Sign-in is not configured yet"

**Cause:** `NUXT_AUTH_BYPASS` is not enabled

**Solution:**
```bash
# Add to .env.local
echo "NUXT_AUTH_BYPASS=true" >> .env.local

# Restart dev server
npm run dev:http
```

### Problem: "Dev session is only available when NUXT_AUTH_BYPASS is enabled"

**Cause:** Same as above — auth bypass not enabled

**Solution:** See above

### Problem: "Minisite session is missing — sign in again"

**Cause:** Mock session created but backend token missing

**Solution:**
1. Clear cookies: DevTools → Application → Cookies → Delete all
2. Sign in again
3. Verify `NUXT_MINISITE_API_BASE` points to correct backend

### Problem: API calls returning 401

**Cause:** Token not being sent to backend

**Debug:**
```typescript
// In dev console
const session = await useUserSession().fetch()
console.log('Session:', session)  // Check if minisiteToken exists
```

### Problem: "Only @loreal.com accounts can sign in"

**Cause:** Mock user email isn't `@loreal.com`

**Solution:** Edit `server/services/auth/sso.service.ts` and ensure:
```typescript
const email = 'dev.user@loreal.com'  // Must have @loreal.com
```

---

## Verifying Integration

### Checklist

- [ ] Mock user can sign in
- [ ] Redirected to dashboard after sign-in
- [ ] User name visible in header
- [ ] Profile endpoint returns user data
- [ ] Leaderboard loads without errors
- [ ] Sessions/agenda displays
- [ ] QR scanner works
- [ ] Check-in awards sparks
- [ ] Sparks balance updates
- [ ] Logout works
- [ ] Protected routes redirect to login

### Manual Test Script

```bash
#!/bin/bash

# Test mock SSO flow
echo "Testing Mock SSO Flow..."

# 1. Create session
echo "1. Creating session..."
curl -X POST http://localhost:3000/api/auth/dev-session \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt

# 2. Fetch profile
echo "2. Fetching profile..."
curl http://localhost:3000/api/minisite/me \
  -b cookies.txt

# 3. Fetch leaderboard
echo "3. Fetching leaderboard..."
curl http://localhost:3000/api/minisite/leaderboard \
  -b cookies.txt

# 4. Fetch sessions
echo "4. Fetching sessions..."
curl http://localhost:3000/api/minisite/sessions \
  -b cookies.txt

echo "All tests passed!"
```

Run:
```bash
chmod +x test-sso.sh
./test-sso.sh
```

---

## Summary

| Scenario | Command | Result |
|----------|---------|--------|
| Quick UI test | `NUXT_AUTH_BYPASS=true npm run dev:http` | Mock user, no backend |
| Full stack test | Backend + `NUXT_AUTH_BYPASS=true` | Complete testing |
| Production backend | `NUXT_MINISITE_API_BASE=https://...` | Real data locally |
| Real SAML (requires Azure AD) | Remove `NUXT_AUTH_BYPASS` | Actual SSO flow |

**Next Steps:**
1. Set `NUXT_AUTH_BYPASS=true` in `.env.local`
2. Start AmplifAI: `npm run dev:http`
3. Click "Sign in with Microsoft" → Instant session
4. Test features: QR scan, leaderboard, orders
5. When Azure AD is ready, disable `NUXT_AUTH_BYPASS`
