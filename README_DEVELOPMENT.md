# AmplifAI Development Guide

Complete setup, testing, and integration documentation for AmplifAI + Minisite.

---

## 🚀 Quick Links

### 📌 START HERE
- **[MOCK_SSO_SETUP_QUICK_START.md](./MOCK_SSO_SETUP_QUICK_START.md)** — Get running in 2 minutes ⚡

### 📚 Core Documentation
- **[MOCK_SSO_SUMMARY.md](./MOCK_SSO_SUMMARY.md)** — Overview of mock SSO system
- **[MOCK_SSO_TESTING_GUIDE.md](./MOCK_SSO_TESTING_GUIDE.md)** — Detailed testing scenarios
- **[TESTING_COMPLETE_FLOW.md](./TESTING_COMPLETE_FLOW.md)** — Full admin → BE → FE flow
- **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** — Backend integration details
- **[ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)** — System architecture

---

## 📋 What's What

### If You Want To...

| Goal | Document | Time |
|------|----------|------|
| **Get started quickly** | [MOCK_SSO_SETUP_QUICK_START](./MOCK_SSO_SETUP_QUICK_START.md) | 2 min ⚡ |
| **Understand mock SSO** | [MOCK_SSO_SUMMARY](./MOCK_SSO_SUMMARY.md) | 5 min |
| **Test without backend** | [MOCK_SSO_TESTING_GUIDE](./MOCK_SSO_TESTING_GUIDE.md) | 10 min |
| **Test full flow** | [TESTING_COMPLETE_FLOW](./TESTING_COMPLETE_FLOW.md) | 15 min |
| **Understand API** | [API_INTEGRATION_GUIDE](./API_INTEGRATION_GUIDE.md) | 20 min |
| **Learn architecture** | [ARCHITECTURE_OVERVIEW](./ARCHITECTURE_OVERVIEW.md) | 20 min |

---

## 🎯 One-Minute Setup

```bash
# 1. Start frontend (already configured)
cd amplifai
npm run dev:http

# 2. Click "Sign in with Microsoft"
# → Instant mock session created
# → No Azure AD needed
# → Ready to test!
```

**That's it!** ✅

---

## 🧪 Testing Scenarios

### Scenario 1: UI Testing Only (No Backend)
```bash
npm run dev:http
# Sign in → Test UI features
# Mock user created locally
# No backend needed
```
→ See: [MOCK_SSO_SETUP_QUICK_START](./MOCK_SSO_SETUP_QUICK_START.md)

### Scenario 2: Full Stack (With Backend)
```bash
# Terminal 1: Backend
cd minisite && npm run dev:3001

# Terminal 2: Frontend
cd amplifai && npm run dev:http

# Test complete flow
```
→ See: [TESTING_COMPLETE_FLOW](./TESTING_COMPLETE_FLOW.md)

### Scenario 3: Multi-User Testing
```bash
npm run dev:http
# Open: http://localhost:3000/dev/sso-test
# Switch between 5 test users instantly
```
→ See: [MOCK_SSO_TESTING_GUIDE](./MOCK_SSO_TESTING_GUIDE.md) (Workflow 2)

---

## 🔑 Key Files

### Frontend Setup
- `.env` — Configuration (✅ Already set up)
- `nuxt.config.ts` — Nuxt config (✅ Already configured)

### Mock SSO System
- `app/pages/dev/sso-test.vue` — Dev testing panel (NEW)
- `server/api/auth/dev-session.post.ts` — Simple mock login (Existing)
- `server/api/auth/dev/mock-saml.post.ts` — Advanced mock SAML (NEW)
- `server/utils/mock-users.ts` — User presets (NEW)
- `server/utils/minisite-client.ts` — Backend proxy

### Authentication
- `composables/useMinisiteAuth.ts` — Auth composable
- `app/components/page/SignIn.vue` — Login UI
- `server/services/auth/` — Auth services

---

## 🌐 Frontend → Backend Flow

```
AmplifAI (Frontend)
├── Server Routes: /api/minisite/* and /api/auth/*
│   └── Proxy to Minisite Backend
├── Composables: useMinisiteAuth, useApi, etc.
│   └── Call server routes
└── Components: SignIn, Dashboard, etc.
    └── Use composables

Minisite (Backend - Vercel)
├── SAML authentication
├── User management
├── Session handling
├── Sparks rewards
└── Admin dashboard
```

→ See: [API_INTEGRATION_GUIDE](./API_INTEGRATION_GUIDE.md)

---

## ✅ Testing Checklist

### Basic Testing
- [ ] Sign in with mock user ✅
- [ ] See dashboard load ✅
- [ ] Complete onboarding ✅
- [ ] View profile ✅

### Full Stack Testing
- [ ] Backend running ✅
- [ ] Check-in works ✅
- [ ] Sparks awarded ✅
- [ ] Leaderboard shows ranking ✅
- [ ] Admin sees activity ✅

### Advanced Testing
- [ ] Multiple users ✅
- [ ] Session persistence ✅
- [ ] Error handling ✅
- [ ] Production backend ✅

→ See: [TESTING_COMPLETE_FLOW](./TESTING_COMPLETE_FLOW.md) for detailed steps

---

## 🔧 Configuration

### Mock SSO (Development Only)
```bash
# In .env
NUXT_AUTH_BYPASS=true        # Enable mock SSO
NUXT_MINISITE_API_BASE=http://localhost:3001  # Local backend
```

### Real SAML (Production)
```bash
NUXT_AUTH_BYPASS=false       # Disable mock, use real SAML
NUXT_SAML_IDP_SSO_URL=...   # From Azure AD
NUXT_SAML_IDP_CERT=...      # From Azure AD
```

→ See: [MOCK_SSO_TESTING_GUIDE](./MOCK_SSO_TESTING_GUIDE.md) (Configuration section)

---

## 🐛 Troubleshooting

| Problem | Solution | Docs |
|---------|----------|------|
| "Sign in not configured" | Set `NUXT_AUTH_BYPASS=true` | [Quick Start](./MOCK_SSO_SETUP_QUICK_START.md) |
| Can't reach backend | Check `NUXT_MINISITE_API_BASE` | [Testing Guide](./MOCK_SSO_TESTING_GUIDE.md) |
| `/dev/sso-test` not found | Only in dev mode (`npm run dev`) | [Testing Guide](./MOCK_SSO_TESTING_GUIDE.md) |
| Sparks not awarded | Session not sent to backend | [API Guide](./API_INTEGRATION_GUIDE.md) |

---

## 🎓 Learning Path

### Level 1: Basics (5 min)
1. Read: [MOCK_SSO_SETUP_QUICK_START](./MOCK_SSO_SETUP_QUICK_START.md)
2. Do: Start app and sign in

### Level 2: Testing (20 min)
1. Read: [MOCK_SSO_SUMMARY](./MOCK_SSO_SUMMARY.md)
2. Read: [TESTING_COMPLETE_FLOW](./TESTING_COMPLETE_FLOW.md)
3. Do: Run through all test scenarios

### Level 3: Integration (30 min)
1. Read: [API_INTEGRATION_GUIDE](./API_INTEGRATION_GUIDE.md)
2. Read: [ARCHITECTURE_OVERVIEW](./ARCHITECTURE_OVERVIEW.md)
3. Understand: How frontend calls backend

### Level 4: Advanced (60 min)
1. Read: Full [MOCK_SSO_TESTING_GUIDE](./MOCK_SSO_TESTING_GUIDE.md)
2. Explore: Dev testing panel `/dev/sso-test`
3. Experiment: Create custom test scenarios

---

## 🚀 Getting Started

### Option A: Quickest Start (2 min)
```bash
cd amplifai
npm run dev:http
# Click sign in button → Done!
```

### Option B: Full Stack (10 min)
```bash
# Terminal 1: Backend
cd minisite && npm run dev:3001

# Terminal 2: Frontend
cd amplifai && npm run dev:http

# Follow: TESTING_COMPLETE_FLOW.md
```

### Option C: Multi-User Testing (5 min)
```bash
cd amplifai
npm run dev:http
# Open: http://localhost:3000/dev/sso-test
# Switch users → Test features
```

---

## 📚 Architecture Overview

### System Layers
```
Client Browser
    ↓
AmplifAI Frontend (Nuxt 4)
    ├── Pages & Components
    ├── Composables & Stores
    └── Server Routes (BFF pattern)
         ↓
Server-Side (Nitro)
    ├── Auth endpoints (/api/auth/*)
    ├── Minisite proxy (/api/minisite/*)
    └── Dev endpoints (/api/dev/*)
         ↓
Minisite Backend (Next.js 14)
    ├── SAML/Auth
    ├── User Management
    ├── Sparks System
    └── Admin Dashboard
         ↓
Database (MongoDB)
```

→ See: [ARCHITECTURE_OVERVIEW](./ARCHITECTURE_OVERVIEW.md)

---

## 🎯 Features Implemented

### Authentication
- ✅ Mock SAML SSO (no Azure AD needed)
- ✅ Real SAML (when Azure AD ready)
- ✅ Session management
- ✅ Token refresh
- ✅ Route protection

### Testing
- ✅ Simple button click sign-in
- ✅ Dev testing panel with 5 presets
- ✅ Custom user creation
- ✅ User switching without restart

### Integration
- ✅ Backend-for-Frontend (BFF) pattern
- ✅ Transparent token injection
- ✅ Error handling & fallbacks
- ✅ Full API proxying

---

## 🔗 Related Projects

- **[Minisite (Backend)](../minisite/)** — Next.js API & Admin Dashboard
- **AmplifAI (Frontend)** — Nuxt 4 PWA (this repo)

---

## 📞 Need Help?

### Quick Questions
1. Check the troubleshooting section above
2. Read relevant documentation
3. Look at code comments

### Complex Issues
1. Check [TESTING_COMPLETE_FLOW.md](./TESTING_COMPLETE_FLOW.md) (Debugging section)
2. Monitor browser DevTools Network tab
3. Check server logs in both terminals

### Report Bugs
1. Document steps to reproduce
2. Include browser console errors
3. Include network requests from DevTools
4. Mention OS and Node.js version

---

## 🎓 Code Examples

### Sign In Component
```typescript
// Already implemented in app/components/page/SignIn.vue
async function signInWithMicrosoft() {
  const devSession = await $fetch('/api/auth/dev-session')
    .catch(err => authErrorStatus(err) === 403 ? null : throw err)
  
  if (devSession) {
    // Mock SSO worked
    await navigateTo('/')
  } else {
    // Fall back to real SAML
    await navigateTo('/api/auth/saml/login', { external: true })
  }
}
```

### API Call with Auth
```typescript
// useMinisiteAuth composable
const { profile } = useMinisiteAuth()
const sparks = profile.value?.sparks  // Auto-authenticated via BFF
```

### Backend API Proxy
```typescript
// server/api/minisite/me.get.ts (already exists)
export default defineEventHandler(async (event) => {
  return proxyMinisiteGet(event, 'me')  // Calls: /api/me on backend
})
```

---

## ✨ Key Takeaways

1. **Mock SSO is built-in** — Click button, instant session
2. **No setup needed** — Already configured in `.env`
3. **Flexible testing** — UI only or full stack
4. **BFF pattern** — Secure, no exposed tokens
5. **Easy to switch** — Mock → Real SAML (1 variable)
6. **Well documented** — 5 comprehensive guides
7. **Production ready** — Works with Vercel

---

## 🎉 You're Ready!

```bash
cd amplifai
npm run dev:http
# Click "Sign in with Microsoft"
# Start testing!
```

**Happy coding! 🚀**

---

## 📖 Document Index

| Document | Purpose | Time |
|----------|---------|------|
| [MOCK_SSO_SETUP_QUICK_START.md](./MOCK_SSO_SETUP_QUICK_START.md) | 2-minute setup | ⚡ |
| [MOCK_SSO_SUMMARY.md](./MOCK_SSO_SUMMARY.md) | What's implemented | 5 min |
| [MOCK_SSO_TESTING_GUIDE.md](./MOCK_SSO_TESTING_GUIDE.md) | Testing workflows | 20 min |
| [TESTING_COMPLETE_FLOW.md](./TESTING_COMPLETE_FLOW.md) | Full flow testing | 30 min |
| [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) | Backend integration | 25 min |
| [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md) | System design | 20 min |

**→ Start with [MOCK_SSO_SETUP_QUICK_START.md](./MOCK_SSO_SETUP_QUICK_START.md)**
