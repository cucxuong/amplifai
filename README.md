# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Authentication (email + password)

1. Copy `.env.example` to `.env` and set `NUXT_SESSION_PASSWORD` (at least 32 characters), e.g. `openssl rand -base64 32`.
2. **Sign up** at `/sign-up` (first name, last name, email, password ≥ 6 chars). A 6-digit verification code is logged to the server console in development (see `[smtp.service]`).
3. **Verify email** at `/sign-up/verify-email` with that code, then sign in at `/sign-in`.
4. **Sign in** at `/sign-in` with the same email and password.
5. **Forgot password:** `/sign-in/forgot-password` → enter code at `/sign-in/verify-code` → set a new password.
6. Optional: configure `NUXT_SMTP_*` for real OTP email delivery.

### Demo shortcuts (temporary — remove before production)

| Shortcut | Value |
|----------|-------|
| OTP (signup + reset) | `111111` |
| Guest sign-in (no signup) | `guest@loreal.com` / `123456` |

Sign-in prefills guest credentials. After signup OTP verify, you are redirected to sign-in with your registered email prefilled (no auto-login).

### Vercel demo bypass (temporary)

On Vercel, auth bypass **auto-enables** via the `VERCEL=1` env var (in-memory storage, relaxed OTP/password checks). You only need:

| Variable | Value |
|----------|-------|
| `NUXT_SESSION_PASSWORD` | 32+ character secret |

Optional overrides:

| Variable | Value | Effect |
|----------|-------|--------|
| `NUXT_AUTH_BYPASS` | `true` | Force bypass on any host (e.g. local demo) |
| `NUXT_AUTH_BYPASS` | `false` | Disable bypass on Vercel (requires persistent storage) |

When bypass is enabled:

- Auth data is stored **in memory** (fixes signup 500 on Vercel's read-only filesystem).
- Sign in with a **registered, verified** email; password is not validated (UI still requires ≥ 6 chars).

Demo shortcuts (`111111` OTP, guest account) work in **all environments** regardless of bypass — see table above.

**Caveats:** user data resets on cold start/redeploy; not shared across serverless instances. Set `NUXT_AUTH_BYPASS=false` and add persistent storage (Vercel KV, Postgres, etc.) before production launch.

### iOS Safari / LAN dev testing

`npm run dev` serves **HTTPS** on `0.0.0.0:3000` for camera QR and secure session cookies on iPhone.

1. Terminal prints **Network** URLs — on iPhone open `https://192.168.x.x:3000` (same Wi‑Fi).
2. **Recommended:** mkcert so Safari trusts the cert (see `.env.example` steps 1–5). Certs go in `.cert/`; the dev script auto-generates them if `mkcert` is installed.
3. **Without mkcert:** Nuxt uses a self-signed cert. The dev script sets `NODE_TLS_REJECT_UNAUTHORIZED=0` locally so SSR and background images (IPX) still work. Safari may warn — tap **Advanced → Proceed**, or install mkcert on the phone.
4. Plain HTTP fallback: `npm run dev:http` (session cookies stay non-Secure in dev).

Production must use real HTTPS; session cookies stay `Secure`.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
