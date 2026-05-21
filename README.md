# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Authentication (Azure AD SAML SSO)

Sign-in uses **Microsoft Entra ID** via **SAML 2.0** (not OAuth). Email/password and sign-up flows are removed.

1. Copy `.env.example` to `.env` and set `NUXT_SESSION_PASSWORD` (at least 32 characters), e.g. `openssl rand -base64 32`.
2. After IT provisions the Azure AD Enterprise Application, set:
   - `NUXT_SAML_IDP_SSO_URL` — IdP Login URL from Azure SAML config
   - `NUXT_SAML_IDP_CERT` — IdP signing certificate (PEM; use `\n` for newlines in Vercel)
3. Optional overrides (defaults match production domain):
   - `NUXT_SAML_ENTITY_ID` — default `https://amplifaiweek.loreal.sg`
   - `NUXT_SAML_ACS_URL` — default `{entityId}/api/auth/saml/acs`
4. Open `/sign-in` → **Continue with Microsoft** → Azure AD login → persona onboarding → `/agenda`.

Only `@loreal.com` accounts are accepted.

### IT ticket — SP values to confirm

Send these to client / IT for the automated Azure ID access ticket:

| Field | Value |
|-------|-------|
| **Reply URL / ACS URL** | `https://amplifaiweek.loreal.sg/api/auth/saml/acs` |
| **Identifier (Entity ID)** | `https://amplifaiweek.loreal.sg` |
| **Sign-on URL** (recommended) | `https://amplifaiweek.loreal.sg/api/auth/saml/login` |
| **SP metadata** (optional) | `https://amplifaiweek.loreal.sg/api/auth/saml/metadata` |

**Ask IT to return after provisioning:**

- IdP SSO URL (Login URL)
- IdP signing certificate (X.509 PEM)
- Claim mapping: email, display name, stable user id (`objectidentifier` or NameID)
- NameID format (usually `persistent` or email)

### Mock SSO bypass (`NUXT_AUTH_BYPASS`)

The Microsoft button tries mock SSO first (`POST /api/auth/dev-session`). If bypass is off, it redirects to SAML login (`GET /api/auth/saml/login`).

| Where | `NUXT_AUTH_BYPASS` unset | `true` | `false` |
|-------|--------------------------|--------|---------|
| Local `npm run dev` | Mock SSO **on** | Mock SSO on | Real SAML |
| Vercel Production / Preview | Real SAML | Mock SSO on | Real SAML |

**Vercel dashboard:** Project → **Settings** → **Environment Variables**:

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `NUXT_SESSION_PASSWORD` | required | required | required |
| `NUXT_SAML_IDP_SSO_URL` | from IT | from IT | optional |
| `NUXT_SAML_IDP_CERT` | from IT | from IT | optional |
| `NUXT_AUTH_BYPASS` | `false` when SAML live | `true` until tested | `true` |

Redeploy after changing env vars. Sync locally: `vercel env pull .env.local`

When bypass is on, auth data is stored **in memory** (resets on cold start). Production with real SSO should use `NUXT_AUTH_BYPASS=false` and persistent user storage.

### Testing checklist

- [ ] `/sign-in` → Microsoft → Azure AD → `/` → persona → `/agenda`
- [ ] Returning user keeps `personaId` and `onboardingComplete`
- [ ] Protected routes redirect to `/sign-in` when logged out
- [ ] Legacy URLs (`/sign-up`, `/sign-in/forgot-password`) redirect to `/sign-in`
- [ ] SAML failure shows error on `/sign-in?error=sso_failed`
- [ ] Sign out on `/me` clears session and returns to `/`
- [ ] Vercel Preview: `NUXT_AUTH_BYPASS=true` → mock SSO; `false` → SAML

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
