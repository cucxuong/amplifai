# AmplifAI ↔ Minisite API Integration Guide

## Overview

AmplifAI (Nuxt frontend) is fully integrated with Minisite (Next.js backend) via the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    AmplifAI (Frontend)                      │
│                   Nuxt 4 PWA on Vercel                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼─────┐          ┌────▼────┐
    │  Server │          │  Client  │
    │  Routes │          │  Browser │
    └───┬─────┘          └────┬─────┘
        │                     │
        │                     └────────┐
        │                              │
        └──────────────────┬───────────┘
                           │
                  ┌────────▼──────────┐
                  │  Minisite API     │
                  │ minisite-roan.    │
                  │ vercel.app/api    │
                  └───────────────────┘
```

---

## Configuration

### Environment Variables

**File:** `.env`
```bash
# Server-side API proxy target
NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app

# Client-side public API endpoint (if used directly)
NUXT_PUBLIC_API_BASE=https://minisite-roan.vercel.app/api
```

**File:** `nuxt.config.ts`
```typescript
runtimeConfig: {
  minisiteApiBase: process.env.NUXT_MINISITE_API_BASE || 'https://minisite-roan.vercel.app',
  minisitePublicApiKey: process.env.NUXT_MINISITE_PUBLIC_API_KEY || '',
  // ... other config
}
```

### How to Change the Backend URL

1. **Local Development (pointing to minisite on `localhost:3001`):**
   ```bash
   # In .env or .env.local
   NUXT_MINISITE_API_BASE=http://localhost:3001
   ```
   Then restart: `npm run dev`

2. **Production Vercel Deployment:**
   - Dashboard → Project Settings → Environment Variables
   - Update `NUXT_MINISITE_API_BASE` to your backend URL
   - Redeploy

---

## API Integration Architecture

### 1. Server-Side Routes (BFF Pattern)

AmplifAI uses a **Backend-for-Frontend (BFF)** pattern where Nuxt server routes proxy requests to Minisite:

**Why BFF?**
- ✅ Hides sensitive tokens from browser (cookies stay on server)
- ✅ Enables cross-origin requests without CORS issues
- ✅ Allows token refresh and error handling at the server level
- ✅ Security: No API keys exposed to client

**Location:** `server/api/minisite/` and `server/api/auth/`

#### Server Route Files

```
server/
├── api/
│   ├── auth/
│   │   ├── saml/
│   │   │   ├── login.get.ts      → Initiates SAML request
│   │   │   ├── acs.post.ts       → Handles SAML assertion
│   │   │   └── metadata.get.ts   → SAML metadata
│   │   └── dev-session.post.ts   → Dev auth bypass
│   ├── minisite/
│   │   ├── me.get.ts             → GET /api/me (user profile)
│   │   ├── me.patch.ts           → PATCH /api/me (update profile)
│   │   ├── check-in.post.ts      → POST /api/check-in (QR scan)
│   │   ├── leaderboard.get.ts    → GET /api/public/leaderboard
│   │   ├── sessions/index.get.ts → GET /api/public/sessions
│   │   ├── products/index.get.ts → GET /api/public/products
│   │   ├── orders/
│   │   │   ├── index.get.ts      → GET /api/orders (user orders)
│   │   │   └── redeem.post.ts    → POST /api/orders/redeem
│   │   └── qr/
│   │       └── redeem.post.ts    → POST /api/qr/redeem
│   └── user/
│       └── onboarding.post.ts    → POST /api/user/onboarding
└── utils/
    └── minisite-client.ts        → Minisite HTTP client
```

### 2. Minisite Client Utility

**File:** `server/utils/minisite-client.ts`

Core function for all server→minisite requests:

```typescript
export async function minisiteFetch<T>(
  path: string,
  options: MinisiteFetchOptions = {},
): Promise<T>
```

**Key features:**
- Constructs full URL from `minisiteApiBase` + `/api/` + path
- Adds Bearer token auth (from session)
- Handles error unwrapping
- Validates response envelope

**Helper functions:**
```typescript
// Authenticated requests (requires user session + token)
proxyMinisiteGet<T>(event, 'path')          // GET with token
proxyMinisitePost<T>(event, 'path')         // POST with token
proxyMinisitePatch<T>(event, 'path')        // PATCH with token

// Public requests (no token required)
proxyMinisitePublicGet<T>(event, 'path')    // GET public endpoint
```

### 3. Authentication Flow

```
Client Browser          AmplifAI Server         Azure AD          Minisite Server
     │                       │                    │                     │
     │─ Click "Sign in" ────>│                    │                     │
     │                       │─ Initiate SAML ───>│                     │
     │                       │<─ Redirect to IdP ─┤                     │
     │<─ Redirect to IdP ────┤                    │                     │
     │                       │                    │                     │
     │─── User authenticates at Azure AD ────────>│                     │
     │                       │<─── SAML Response ─┤                     │
     │<────── Redirect to ACS ─────────────────────┤                     │
     │                       │                    │                     │
     │─ POST /api/auth/saml/acs ───────────────────────────────────────>│
     │ (with SAML assertion)                      │                     │
     │                       │<─ Create User ─────────────────────────────│
     │                       │<─ Issue JWT Token ────────────────────────│
     │                       │                    │                     │
     │                       │─ Set minisiteToken in session ──────────>│
     │                       │                    │                     │
     │<─ Redirect to / ──────┤                    │                     │
     │                       │                    │                     │
```

**Files involved:**
- `server/api/auth/saml/login.get.ts` - Initiates SAML request
- `server/api/auth/saml/acs.post.ts` - Processes SAML assertion
- `server/services/auth/saml.service.ts` - SAML parsing & validation
- `server/services/auth/sso.service.ts` - User creation/update

### 4. Session & Token Management

**Token Storage:**
- Access Token: HttpOnly cookie `minisiteToken` (set by ACS endpoint)
- Refresh Token: Handled by Minisite server
- Session: Stored in `useUserSession()` composable

**Token Refresh Flow:**
```
Client makes API call
         ↓
Token expired (401 response)
         ↓
Server automatically refreshes token
         ↓
Retry original request
         ↓
Return to client
```

**Files:**
- `composables/useAuthSession.ts` - Session refresh
- `server/utils/minisite-client.ts` - Token injection
- `middleware/auth.global.ts` - Route protection

### 5. API Endpoint Map

| Frontend Route | Server Route | Minisite Endpoint | Method | Auth |
|---|---|---|---|---|
| Dashboard | `/api/minisite/me` | `GET /me` | GET | ✓ |
| Profile Edit | `/api/minisite/me` | `PATCH /me` | PATCH | ✓ |
| QR Scan | `/api/minisite/check-in` | `POST /check-in` | POST | ✓ |
| Leaderboard | `/api/minisite/leaderboard` | `GET /public/leaderboard` | GET | ✗ |
| Sessions | `/api/minisite/sessions` | `GET /public/sessions` | GET | ✗ |
| Products | `/api/minisite/products` | `GET /public/products` | GET | ✗ |
| My Orders | `/api/minisite/orders` | `GET /orders` | GET | ✓ |
| Redeem Sparks | `/api/minisite/orders/redeem` | `POST /orders/redeem` | POST | ✓ |
| Onboarding | `/api/user/onboarding` | `POST /user/onboarding` | POST | ✓ |

---

## Client-Side API Calls

### useApi Composable

**File:** `composables/useApi.ts`

Minimal wrapper around `$fetch` for type-safe requests:

```typescript
const { get, post, patch } = useApi()

// GET request
const user = await get<User>('/api/minisite/me')

// POST request
const result = await post<CheckInResult>('/api/minisite/check-in', {
  qrData: '...'
})

// PATCH request
const updated = await patch<User>('/api/minisite/me', {
  firstName: 'John'
})
```

### useMinisiteAuth Composable

**File:** `composables/useMinisiteAuth.ts`

High-level auth helpers:

```typescript
const { loggedIn, session, user } = useMinisiteAuth()

// Fetch current user profile
const profile = await useMinisiteAuth().fetchMe()

// Update profile
await useMinisiteAuth().updateProfile({
  persona: 'innovator',
  firstName: 'Jane'
})

// Complete onboarding
await useMinisiteAuth().completeOnboarding({
  personaId: 'innovator'
})
```

### useUserStore

**File:** `app/stores/userStore.ts` (reference via useMinisiteAuth)

State management for user profile, sparks balance, rank:

```typescript
const userStore = useUserStore()
userStore.profile    // User profile object
userStore.sparks     // Current sparks balance
userStore.rank       // Leaderboard rank
```

---

## Error Handling

### Server-Side Error Handling

**Location:** `server/utils/minisite-client.ts`

```typescript
function unwrapMinisiteError(error: unknown): never {
  const fetchError = error as FetchError<MinisiteApiEnvelope<unknown>>
  const status = fetchError.response?.status ?? 502
  const message = fetchError.data?.error ?? 'Minisite API request failed'
  throw createError({ statusCode: status, message })
}
```

**Minisite Response Envelope:**
```typescript
interface MinisiteApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
}
```

### Client-Side Error Handling

Errors from Minisite API are wrapped in H3 errors and thrown as `useFetch` errors:

```typescript
const { data, error } = await useAsyncData(() =>
  $fetch('/api/minisite/me')
)

if (error.value) {
  console.error(error.value.statusCode, error.value.message)
}
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|---|---|---|
| 502 Bad Gateway | Minisite API unreachable | Check `NUXT_MINISITE_API_BASE` URL, verify Minisite is running |
| 401 Unauthorized | Token expired/missing | Refresh session, user may need to re-authenticate |
| 403 Forbidden | User lacks permission | Check user role, verify email domain |
| CORS errors | Direct client→minisite call | Always use server routes (BFF pattern), never direct fetch |
| "Minisite session is missing" | User not authenticated | User must sign in first |

---

## Development Workflow

### Local Development

**Setup:**
```bash
# Terminal 1: Start Minisite (port 3001)
cd minisite
npm install
npm run dev          # or npm run dev:3001

# Terminal 2: Start AmplifAI (port 3000)
cd amplifai
npm install
npm run dev:http     # or npm run dev for HTTPS
```

**Update .env:**
```bash
NUXT_MINISITE_API_BASE=http://localhost:3001
```

**Verify Integration:**
```bash
# These should work:
curl http://localhost:3000/api/minisite/leaderboard
curl http://localhost:3000/api/minisite/sessions
```

### Environment-Based Configuration

**Development (.env):**
```
NUXT_MINISITE_API_BASE=http://localhost:3001
NUXT_AUTH_BYPASS=true
```

**Staging (.env.staging):**
```
NUXT_MINISITE_API_BASE=https://minisite-staging.vercel.app
```

**Production (Vercel Dashboard):**
```
NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app
NUXT_AUTH_BYPASS=false
```

---

## Testing

### Testing Server Routes

```typescript
// server/api/minisite/me.get.ts test
describe('GET /api/minisite/me', () => {
  it('should fetch user profile', async () => {
    const event = createTestEvent()
    const result = await me(event)
    expect(result).toHaveProperty('email')
  })

  it('should require authentication', async () => {
    const event = createTestEvent({ authenticated: false })
    await expect(me(event)).rejects.toThrow('missing')
  })
})
```

### Testing Composables

```typescript
// composables/useMinisiteAuth.ts test
describe('useMinisiteAuth', () => {
  it('should fetch user profile', async () => {
    const { fetchMe } = useMinisiteAuth()
    const profile = await fetchMe()
    expect(profile).toHaveProperty('email')
  })
})
```

### E2E Testing

```typescript
// E2E: Sign in → Fetch profile → Check leaderboard
describe('API Integration E2E', () => {
  it('should complete full flow', async () => {
    // 1. User signs in
    await page.goto('/sign-in')
    // ... sign-in flow
    
    // 2. Server fetches profile
    const response = await page.request.get('/api/minisite/me')
    expect(response.ok()).toBeTruthy()
    
    // 3. Leaderboard loads
    await page.goto('/leaderboard')
    await expect(page.locator('[data-test="leaderboard"]')).toBeVisible()
  })
})
```

---

## Monitoring & Debugging

### Network Requests

1. **Browser DevTools → Network tab:**
   - Check requests to `/api/minisite/*` routes
   - Verify headers include `Authorization` cookie
   - Response should be wrapped in `MinisiteApiEnvelope`

2. **Server Logs:**
   ```bash
   npm run dev     # Shows H3 router logs
   ```

### Common Debug Patterns

```typescript
// In server route
console.log('Calling minisite:', url)
console.log('With token:', token ? 'yes' : 'no')

const result = await minisiteFetch(path, { token })
console.log('Response:', result)
```

### Health Check

```bash
# Check if both services are up
curl https://minisite-roan.vercel.app/api/public/sessions
curl https://amplifaiweek-roan.vercel.app/api/minisite/leaderboard
```

---

## Security Considerations

### ✅ Current Implementation

- **No Client-Side Tokens:** All tokens are HttpOnly cookies, not exposed to JS
- **Server-Side Proxying:** Sensitive requests never exposed to browser
- **CORS Protected:** Client can't make direct requests to Minisite (unless explicitly allowed)
- **Token Injection:** Server automatically injects auth header
- **Session Validation:** All routes verify authentication via `requireUserSession()`

### ⚠️ Best Practices

1. **Never expose tokens in client code:**
   ```typescript
   // ❌ BAD
   const token = localStorage.getItem('token')
   fetch('https://minisite-roan.vercel.app/api/me', {
     headers: { Authorization: `Bearer ${token}` }
   })

   // ✅ GOOD
   fetch('/api/minisite/me')  // Server injects token
   ```

2. **Validate all user input on server:**
   ```typescript
   const body = await readBody(event)  // Already validated by Minisite
   ```

3. **Keep sensitive endpoints behind auth:**
   ```typescript
   await requireMinisiteToken(event)  // Throws if unauthenticated
   ```

---

## Summary

✅ **Currently Integrated:**
- Server routes proxy to `https://minisite-roan.vercel.app`
- Authentication via SAML with token management
- All API calls use BFF pattern for security
- Environment-based configuration
- Error handling and session refresh

✅ **Ready for:**
- Local development (update .env)
- Production deployment (Vercel)
- Feature expansion (new routes follow same pattern)

**To add a new API endpoint:**
1. Create server route: `server/api/minisite/[endpoint].ts`
2. Use `proxyMinisiteGet/Post/Patch` helper
3. Call from client via `useApi()` or `useMinisiteAuth()`
4. Add tests for both server route and composable
