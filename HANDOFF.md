# AmplifAI — session handoff (2026-05-21)

Resume here on another machine after `git pull`. Do **not** commit `.env` / `.env.local` (secrets).

---

## Current blocker (local dev minisite 401)

**Symptom:** `PATCH /api/minisite/me` → 401, or sign-in warning "event backend not linked".

**Root cause:** Amplifai session missing `minisiteToken` because SSO bridge to minisite failed at login.

**Bridge flow:**
1. Dev bypass / SAML → `buildSessionWithMinisiteBridge()` in `server/services/minisite/bridge.service.ts`
2. POST minisite `/api/auth/sso-bridge` with `X-Internal-Key`
3. On success, store `minisiteToken` in sealed session
4. BFF routes use `requireMinisiteToken()` → proxies to minisite with Bearer JWT

**Already implemented (in this commit):**
- Dev bridge failure logs: `[minisite-bridge] SSO bridge failed`
- Lazy re-bridge in `requireMinisiteToken` when token missing
- `dev-session` returns `{ minisiteLinked: boolean }`
- Sign-in / PickPersona / user store 401 handling + `MinisiteUnavailableBanner`

---

## Env setup (local machine — not in git)

### amplifai `.env.local`

Required (recreate after pull on new PC):

```env
NUXT_AUTH_BYPASS=true
NUXT_SESSION_PASSWORD=<32+ chars>
NUXT_MINISITE_API_BASE=http://localhost:3001
NUXT_MINISITE_INTERNAL_KEY=9WbqXrvbPOnOiH3D0kvicaU+pSu9q8bD+vIgATX9kLY=
```

### minisite `.env.local` (separate repo)

**Still needed:** `MONGODB_URI` (MongoDB Atlas connection string).

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<any dev secret>
JWT_SECRET=<same or different>
SSO_BRIDGE_INTERNAL_KEY=9WbqXrvbPOnOiH3D0kvicaU+pSu9q8bD+vIgATX9kLY=
```

Keys must match between amplifai `NUXT_MINISITE_INTERNAL_KEY` and minisite `SSO_BRIDGE_INTERNAL_KEY`.

---

## Important discovery

- Default `https://minisite-roan.vercel.app` is **not** under Vercel team `cucxuongs-projects` — requires unknown `SSO_BRIDGE_INTERNAL_KEY`.
- Your minisite project: **`cucxuongs-projects/minisite`** (linked via `vercel link` in minisite folder).
- `SSO_BRIDGE_INTERNAL_KEY` was added to minisite Vercel (development + production) with the key above.

**Local dev path (recommended until MongoDB + deploy):**
1. minisite: `npm run dev:3001` (port 3001)
2. amplifai: `npm run dev` (port 3000 HTTPS)
3. Sign out → sign in after env changes

**Smoke test:**
```bash
curl -X POST http://localhost:3001/api/auth/sso-bridge \
  -H "Content-Type: application/json" \
  -H "X-Internal-Key: 9WbqXrvbPOnOiH3D0kvicaU+pSu9q8bD+vIgATX9kLY=" \
  -d '{"email":"dev.user@loreal.com","firstName":"Dev","lastName":"User"}'
```
Expect `"success":true`. 500 = missing `MONGODB_URI`. 401 = key mismatch.

---

## TODO tomorrow

- [ ] Get `MONGODB_URI` (Atlas or team-provided) → paste into minisite `.env.local`
- [ ] Restart minisite (`npm run dev:3001`) + amplifai dev server
- [ ] Sign out, dev bypass sign-in → confirm no "backend not linked" warning
- [ ] Pick persona → should PATCH `/api/minisite/me` without 401
- [ ] Optional: deploy minisite to Vercel, set `MONGODB_URI` + keys there, point `NUXT_MINISITE_API_BASE` to deploy URL
- [ ] Optional: add same minisite env vars to amplifai Vercel project for preview/prod

---

## Repos

| Repo | Remote |
|------|--------|
| amplifai (frontend + BFF) | this repo — `git pull` on new machine |
| minisite (backend API) | GitHub `thilyvu/minisite` — separate clone |

---

## Work completed this session (code)

- Minisite BFF: `/api/minisite/*`, Pinia stores, composables, mappers
- Removed legacy email/OTP auth UI + server routes
- SAML + dev bypass → minisite bridge
- QR scan: minisite codes, performance (ROI decode, BarcodeDetector, prefetch zxing)
- Typecheck fixes (`shared/auth.d.ts`, SAML, minisite-client)
- Minisite 401 diagnostics + lazy re-bridge + client UX

---

## Key files

| Area | Files |
|------|-------|
| Bridge | `server/services/minisite/bridge.service.ts` |
| BFF proxy | `server/utils/minisite-client.ts`, `server/api/minisite/` |
| Auth session | `server/api/auth/dev-session.post.ts`, `shared/auth.d.ts` |
| Client stores | `app/stores/user.ts`, `checkIn.ts`, `agenda.ts`, `leaderboard.ts` |
| Sign-in UX | `app/components/page/SignIn.vue` |
| Persona | `app/components/page/PickPersona.vue` |
| Env docs | `.env.example`, `README.md` |

---

## Dev commands

```powershell
# Terminal 1 — minisite
cd path/to/minisite
npm install   # first time only
npm run dev:3001

# Terminal 2 — amplifai
cd path/to/amplifai
npm run dev
```

After pull on new PC: recreate `.env.local` files from sections above (copy securely — not via git).
