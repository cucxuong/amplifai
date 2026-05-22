# Cloudflare Pages — dashboard setup

Apply in **Workers & Pages → amplifai → Settings**.

## Build

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |

Do **not** use `npm run generate`.

## Environment variables

### Shared (Production + Preview)

| Variable | Value |
|----------|--------|
| `NODE_VERSION` | `20` |
| `NUXT_SESSION_PASSWORD` | 32+ char secret |
| `NUXT_MINISITE_API_BASE` | `https://minisite-roan.vercel.app` |
| `NUXT_MINISITE_PUBLIC_API_KEY` | Only if minisite requires `PUBLIC_API_KEY` |

### Preview environment (`*.pages.dev`)

| Variable | Value |
|----------|--------|
| `NUXT_AUTH_BYPASS` | `true` |
| `NUXT_SAML_ENTITY_ID` | `https://YOUR-PROJECT.pages.dev` (only if testing SAML on preview) |
| `NUXT_SAML_ACS_URL` | `https://YOUR-PROJECT.pages.dev/api/auth/saml/acs` |

With bypass enabled, SAML vars are optional for preview testing.

### Production environment (custom domain)

| Variable | Value |
|----------|--------|
| `NUXT_AUTH_BYPASS` | `false` |
| `NUXT_SAML_ENTITY_ID` | `https://amplifaiweek.loreal.sg` |
| `NUXT_SAML_ACS_URL` | `https://amplifaiweek.loreal.sg/api/auth/saml/acs` |
| `NUXT_SAML_IDP_SSO_URL` | From Azure AD IT |
| `NUXT_SAML_IDP_CERT` | From Azure AD IT (PEM) |

Register **Production** Reply URL / Entity ID in Azure AD — use the custom domain, not `pages.dev`.

## Verify after deploy

```text
GET https://YOUR-PROJECT.pages.dev/api/minisite/sessions
```

| Response | Meaning |
|----------|---------|
| JSON or 502 | Worker OK — fix minisite if 502 |
| HTML 404 | Wrong build output or missing `cloudflare-pages` preset |
| 403 on sign-in | Set `NUXT_AUTH_BYPASS=true` (preview) or configure SAML (prod) |
| 500 on auth routes | Missing `NUXT_SESSION_PASSWORD` |

## Secrets via CLI (optional)

```bash
echo "your-secret" | npx wrangler pages secret put NUXT_SESSION_PASSWORD --project-name=amplifai
```
