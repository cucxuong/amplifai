# AmplifAI — session handoff

Resume here on another machine after `git pull`. Do **not** commit `.env` / `.env.local` (secrets).

---

## Architecture (current)

**Amplifai auth:** SAML SSO or dev bypass (`NUXT_AUTH_BYPASS`) — amplifai session only (email, persona, onboarding). No SSO bridge to minisite on login.

**Read-only event data:** Nuxt BFF `GET /api/minisite/sessions|leaderboard|products` proxies to minisite **`/api/public/*`** (`proxyMinisitePublicGet`). No JWT. Optional **`NUXT_MINISITE_PUBLIC_API_KEY`** only if minisite sets `PUBLIC_API_KEY`.

**Writes / personalised minisite data:** Routes that still use `requireMinisiteToken` (`/api/minisite/me`, check-in, orders, QR redeem) need a **`minisiteToken`** on the amplifai session. That token is **not** issued anymore by amplifai (bridge removed). These features stay blocked until minisite auth is plugged in separately (e.g. login/register JWT or restored bridge).

**Key server files:**
- Payload after sign-in: `server/services/minisite/session.service.ts` (`buildUserSessionPayload`)
- BFF proxy: `server/utils/minisite-client.ts`, `server/api/minisite/`

---

## amplifai `.env.local` (not in git)

```env
NUXT_SESSION_PASSWORD=<32+ chars>
NUXT_MINISITE_API_BASE=https://minisite-roan.vercel.app
# NUXT_MINISITE_PUBLIC_API_KEY=...   # if minisite enables PUBLIC_API_KEY
NUXT_AUTH_BYPASS=true   # dev only — false / unset on prod with SAML
```

Local minisite: set `NUXT_MINISITE_API_BASE=http://localhost:3001` (or matching port).

---

## Amplifai Vercel (production checklist)

| Variable | Production |
|----------|------------|
| `NUXT_SESSION_PASSWORD` | Required (32+ chars) |
| `NUXT_MINISITE_API_BASE` | `https://minisite-roan.vercel.app` (or set explicitly) |
| `NUXT_MINISITE_PUBLIC_API_KEY` | Optional — match minisite `PUBLIC_API_KEY` if set |
| `NUXT_AUTH_BYPASS` | `false` when SAML is live |
| `NUXT_SAML_IDP_SSO_URL` / `NUXT_SAML_IDP_CERT` | From IT when SAML goes live |

**Smoke:** minisite public API should return data server-side:

`curl https://minisite-roan.vercel.app/api/public/sessions`

---

## minisite repo (optional local)

Separate clone for running your own backend. Public routes need MongoDB (`MONGODB_URI`) on deployed minisite. See minisite repo docs for full env.

---

## Repos

| Repo | Remote |
|------|--------|
| amplifai (frontend + BFF) | this repo |
| minisite (backend API) | separate clone |

---

## Dev commands

```powershell
# amplifai
cd path/to/amplifai
npm run dev

# Optional: local minisite (other terminal)
cd path/to/minisite
npm run dev -- -p 3001
```

Recreate `.env.local` locally after pull (never commit secrets).
