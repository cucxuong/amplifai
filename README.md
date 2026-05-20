# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Authentication (email + password)

1. Copy `.env.example` to `.env` and set `NUXT_SESSION_PASSWORD` (at least 32 characters), e.g. `openssl rand -base64 32`.
2. **Sign up** at `/sign-up` (first name, last name, email, password ≥ 8 chars). A 6-digit verification code is logged to the server console in development (see `[smtp.service]`).
3. **Verify email** at `/sign-up/verify-email` with that code, then complete onboarding.
4. **Sign in** at `/sign-in` with the same email and password.
5. **Forgot password:** `/sign-in/forgot-password` → enter code at `/sign-in/verify-code` → set a new password.
6. Optional: configure `NUXT_SMTP_*` for real OTP email delivery.

### iOS Safari / LAN dev testing

When testing on a phone over `http://192.168.x.x:3000` (`npm run dev --host`), session cookies use `Secure: false` in development so iOS Safari accepts them. Restart the dev server after changing session config. Production must be served over HTTPS (cookies stay `Secure`).

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
