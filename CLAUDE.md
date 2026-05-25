# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code conventions

These four rules apply to every task in this repo. When in doubt, err on the side of caution over speed.

**Think before coding.** State assumptions before writing code. If the request has multiple interpretations, present them and ask — don't pick silently. If something is unclear, stop and name it.

**Simplicity first.** Write the minimum code that solves the problem. No speculative features, no abstractions for single-use code, no "flexibility" that wasn't asked for. If a solution could be 50 lines but is 200, rewrite it.

**Surgical changes.** Touch only what the request requires. Don't improve adjacent code, comments, or formatting. Match existing style. If unrelated dead code is noticed, mention it — don't delete it. Clean up only imports/variables/functions that *your own* changes orphaned.

**Goal-driven execution.** For multi-step tasks, state a brief plan with a verifiable check at each step before writing the first line of code:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

## Commands

```bash
npm run dev          # HTTPS dev server (auto-detects mkcert certs in .cert/)
npm run dev:http     # plain HTTP dev server (no mkcert required)
npm run build        # production build
npm run preview      # preview production build locally
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

No test suite is configured. There is no `npm test` command.

### Dev HTTPS setup (required for mobile camera / QR scanning)

`npm run dev` calls `.cursor/scripts/dev-https.mjs`, which runs `nuxt dev --host` and automatically passes `--https.key` / `--https.cert` if `.cert/localhost-key.pem` and `.cert/localhost.pem` exist.

To generate certs: `mkcert -key-file .cert/localhost-key.pem -cert-file .cert/localhost.pem localhost 127.0.0.1 ::1 YOUR_LAN_IP`. Without certs, `npm run dev:http` runs plain HTTP (camera will not work on iOS Safari over Wi-Fi).

## Architecture overview

This is a **Nuxt 4 full-stack app** that acts as a BFF (Backend for Frontend) for an event called AmplifAI Week. All real data lives in an external **minisite API** (default: `https://minisite-roan.vercel.app`). This app handles auth and proxies every data request server-side.

### Directory structure

- `app/` — Vue 3 frontend (Nuxt `srcDir`)
  - `pages/` — file-based routes
  - `components/` — `app/`, `auth/`, `glass-panel/`, `page/`, `ui/` sub-folders
  - `composables/` — reusable Vue composables
  - `stores/` — Pinia stores
  - `layouts/` — `default.vue` (thin wrapper), `shell.vue` (authenticated shell)
  - `plugins/` — `minisite.client.ts` (boot fetch), `page-transition.client.ts`, `app-scroll-pin.client.ts`
  - `middleware/auth.global.ts` — route guard
  - `utils/` — `cn.ts`, `page-backgrounds.ts`, `route-transition.ts`, etc.
- `server/` — Nitro server
  - `api/auth/` — SAML SSO endpoints (`/login`, `/acs`, `/metadata`), dev mock endpoints
  - `api/minisite/` — proxy routes for sessions, leaderboard, check-in, gifts, orders, etc.
  - `services/auth/` — SAML parsing, user storage, SSO logic
  - `utils/minisite-client.ts` — typed fetch helpers used by all `/api/minisite/*` handlers
- `shared/` — types and utils imported by both sides
  - `auth.d.ts` — augments `#auth-utils` with `UserSession` shape
  - `types/minisite/index.ts` — all minisite API response types
  - `utils/personas.ts` — the 7 fixed event personas

### Authentication flow

1. User visits `/sign-in` → clicks Microsoft SSO button → redirected to Azure AD via SAML (`/api/auth/saml/login`).
2. Azure AD posts SAML assertion to `/api/auth/saml/acs`, which calls `sso.service.ts` to find/create the user in server-side storage and exchanges for a minisite JWT token.
3. `nuxt-auth-utils` sets a signed encrypted session cookie containing `{ user, minisiteToken, minisiteUserId, personaId, onboardingComplete }`.
4. Global middleware (`auth.global.ts`) guards all routes; only `/` and `/sign-in/**` are public. Authenticated users are sent to `/agenda`.
5. After sign-in, if `onboardingComplete=false`, user must visit `/pick-persona` to choose a persona before accessing other routes.

**Dev bypass**: `NUXT_AUTH_BYPASS` defaults to `true` in development. When enabled, `/api/auth/dev-session` creates a mock session for `dev.user@loreal.com` without any IdP. The sign-in page renders a mock SSO button in bypass mode.

**Only `@loreal.com` email addresses are allowed** (`sso.service.ts:ALLOWED_EMAIL_DOMAIN`).

### Minisite proxy pattern

All `/api/minisite/*` server routes follow the same pattern: extract the session's `minisiteToken` via `requireMinisiteToken(event)`, then call `minisiteFetch` / `proxyMinisite*` helpers in `server/utils/minisite-client.ts`. The minisite API envelope is `{ success, data, error }`.

Client-side code never calls the minisite API directly — it calls this app's `/api/minisite/*` routes using `useApi()` (a thin wrapper around `$fetch`).

### State management

Pinia stores handle server-fetched data:
- `useUserStore` — current user profile, sparks, rank, recent activity
- `useAgendaStore` — conference sessions (fetched once, cached in store)
- `useLeaderboardStore` — leaderboard entries
- `useOrdersStore` / `useProductsStore` — gift shop
- `useCurrentUserStore` — user's personal schedule
- `useCheckInStore` — QR check-in result state

All stores call `useMinisiteStatus().markUnavailable()` on 401 errors to show an unavailability banner.

On client boot, `plugins/minisite.client.ts` pre-fetches sessions and user profile if logged in.

### Background / theming system

`usePageBodyBackground` (called once in `app.vue`) applies CSS backgrounds directly to `document.body` based on the current route path. The mapping is in `utils/page-backgrounds.ts`. There are two source images: `/slash.png` (landing) and `/global-bg.png` (all other routes). The gradient overlay is kept identical across routes so only `background-position` animates during navigation.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite`. Use `cn()` from `~/utils/cn.ts` (clsx + tailwind-merge) for conditional class merging. All L'Oréal brand fonts (Essentielle, Heritage, Royale) are self-hosted in `app/assets/fonts/Loreal/` and registered in `nuxt.config.ts`. Custom SVG icons use the `amplif:` prefix (from `app/assets/fonts/icon/`).

### QR scanning

`useQrScanner` composable lazy-loads `@zxing/browser` only when the scan page activates the camera. It prefers the native `BarcodeDetector` API and falls back to ZXing. HTTPS is required for `getUserMedia` on mobile browsers.

### Server-side user persistence

In production, user records are stored via `useStorage('data')` (filesystem). When `authBypass` is enabled (dev default), an in-memory `Map` is used instead. The storage key is `auth:users` — a JSON record keyed by lowercase email.

## Key environment variables

| Variable | Purpose |
|---|---|
| `NUXT_SESSION_PASSWORD` | Required — min 32 chars, signs session cookies |
| `NUXT_MINISITE_API_BASE` | Minisite API origin (default: `https://minisite-roan.vercel.app`) |
| `NUXT_MINISITE_PUBLIC_API_KEY` | Optional `X-API-Key` for public minisite endpoints |
| `NUXT_AUTH_BYPASS` | `true` = skip SAML, use mock user; default `true` in dev |
| `NUXT_SAML_ENTITY_ID` / `NUXT_SAML_ACS_URL` | SP identity for Azure AD |
| `NUXT_SAML_IDP_SSO_URL` / `NUXT_SAML_IDP_CERT` | IdP credentials from IT |
| `NUXT_DEV_HTTPS` | Set to `false` to force HTTP in dev |
