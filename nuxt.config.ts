import fs from 'node:fs'
import path from 'node:path'
import type { ServerOptions as HttpsServerOptions } from 'node:https'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { createResolver } from 'nuxt/kit'

const { resolve } = createResolver(import.meta.url)
const rootDir = path.dirname(fileURLToPath(import.meta.url))
const devCertDir = path.join(rootDir, '.cert')

function devCertPaths() {
  return {
    key: process.env.NUXT_DEV_HTTPS_KEY ?? path.join(devCertDir, 'localhost-key.pem'),
    cert: process.env.NUXT_DEV_HTTPS_CERT ?? path.join(devCertDir, 'localhost.pem'),
  }
}

function hasDevCertFiles() {
  const { key, cert } = devCertPaths()
  return fs.existsSync(key) && fs.existsSync(cert)
}

/** mkcert files in .cert/ — see .env.example */
function resolveDevHttps(): HttpsServerOptions {
  const { key, cert } = devCertPaths()
  return {
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
  }
}

const lorealFontsDir = './app/assets/fonts/Loreal'

// One entry per file: same `name` repeats for multiple @font-face of one CSS family.
const lorealFontFiles = [
  // Essentielle (OTF)
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-Black.otf', format: 'opentype' as const, weight: 900, style: 'normal' as const },
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-BlackItalic.otf', format: 'opentype' as const, weight: 900, style: 'italic' as const },
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-Bold.otf', format: 'opentype' as const, weight: 700, style: 'normal' as const },
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-BoldItalic.otf', format: 'opentype' as const, weight: 700, style: 'italic' as const },
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-Italic.otf', format: 'opentype' as const, weight: 400, style: 'italic' as const },
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-Light.otf', format: 'opentype' as const, weight: 300, style: 'normal' as const },
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-LightItalic.otf', format: 'opentype' as const, weight: 300, style: 'italic' as const },
  { name: 'Loreal Essentielle', rel: 'Essentielle/LOREAL-Essentielle-Regular.otf', format: 'opentype' as const, weight: 400, style: 'normal' as const },
  // Heritage
  { name: 'Loreal Heritage', rel: 'Heritage/LOREAL-Heritage-Regular.otf', format: 'opentype' as const, weight: 400, style: 'normal' as const },
  // Royale (TTF)
  { name: 'Loreal Royale', rel: 'Royale/LOREAL-Royale-Bold.ttf', format: 'truetype' as const, weight: 700, style: 'normal' as const },
  { name: 'Loreal Royale', rel: 'Royale/LOREAL-Royale-Regular.ttf', format: 'truetype' as const, weight: 400, style: 'normal' as const },
] as const

const lorealFamilies = lorealFontFiles.map(({ name, rel, format, weight, style }) => ({
  name,
  global: true,
  weight,
  style,
  src: [{ url: resolve(lorealFontsDir, rel), format }],
}))


const isProduction = process.env.NODE_ENV === 'production'
const devHttpsEnabled = !isProduction && process.env.NUXT_DEV_HTTPS !== 'false'

function envFlag(name: string, fallback = false): boolean {
  const value = process.env[name]?.trim()
  if (value === 'true' || value === '1')
    return true
  if (value === 'false' || value === '0')
    return false
  return fallback
}

/** Loaded from .env at dev/build start; overridden at runtime by NUXT_AUTH_BYPASS on Vercel. */
const authBypassDefault = envFlag('NUXT_AUTH_BYPASS', !isProduction)

const sessionCookieSecure
  = process.env.NUXT_SESSION_COOKIE_SECURE === 'true'
    ? true
    : process.env.NUXT_SESSION_COOKIE_SECURE === 'false'
      ? false
      : isProduction || devHttpsEnabled

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  runtimeConfig: {
    /** Overridden at runtime by NUXT_AUTH_BYPASS (Vercel dashboard / .env). */
    authBypass: authBypassDefault,
    public: {
      authBypass: authBypassDefault,
    },
    minisiteApiBase: process.env.NUXT_MINISITE_API_BASE || 'https://minisite-roan.vercel.app',
    /** Optional; only when deployed minisite sets PUBLIC_API_KEY. */
    minisitePublicApiKey: process.env.NUXT_MINISITE_PUBLIC_API_KEY || '',
    samlEntityId: process.env.NUXT_SAML_ENTITY_ID || '',
    samlAcsUrl: process.env.NUXT_SAML_ACS_URL || '',
    samlIdpSsoUrl: process.env.NUXT_SAML_IDP_SSO_URL || '',
    samlIdpCert: process.env.NUXT_SAML_IDP_CERT || '',
    samlDisableRequestedAuthnContext: envFlag('NUXT_SAML_DISABLE_REQUESTED_AUTHN_CONTEXT', true),
    samlForceAuthn: envFlag('NUXT_SAML_FORCE_AUTHN', false),
    session: {
      cookie: {
        secure: sessionCookieSecure,
        sameSite: 'lax',
        httpOnly: true,
      },
    },
  },

  // Force bare Node.js core module imports (crypto, stream, events) to resolve to
  // the node: prefixed externals so CF Workers uses its native nodejs_compat implementations
  // instead of unenv polyfills. Without this, xml-crypto's crypto.createVerify() returns
  // a stream object whose EventEmitter prototype chain is broken in the V8 isolate.
  nitro: {
    rollupConfig: {
      plugins: [
        {
          name: 'native-node-modules',
          resolveId(id: string) {
            const map: Record<string, string> = {
              crypto: 'node:crypto',
              stream: 'node:stream',
              events: 'node:events',
              zlib: 'node:zlib',
            }
            if (map[id]) return { id: map[id], external: true }
          },
        },
      ],
    },
  },

  // HTTPS: use `npm run dev` (.cursor/scripts/dev-https.mjs → nuxt --https).
  // mkcert files in .cert/ are passed via --https.key / --https.cert when present.
  vite: {
    plugins: [
      tailwindcss(),
    ],
    ...(devHttpsEnabled && hasDevCertFiles()
      ? { server: { https: resolveDevHttps() } }
      : {}),
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
  ],

  css: ['./app/assets/css/tailwind.css'],

  routeRules: {
    '/sign-up': { redirect: { to: '/sign-in', statusCode: 301 } },
    '/sign-up/verify-email': { redirect: { to: '/sign-in', statusCode: 301 } },
    '/sign-in/forgot-password': { redirect: { to: '/sign-in', statusCode: 301 } },
    '/sign-in/verify-code': { redirect: { to: '/sign-in', statusCode: 301 } },
  },

  app: {
    baseURL: '/',
    head: {
      title: 'AmplifAI Week - L\'Oréal',
      script: [
        {
          key: 'app-scroll-pin',
          src: '/app-scroll-pin-init.js',
          tagPosition: 'head',
          defer: false,
          async: false,
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#000' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
  },

  fonts: {
    providers: {
      adobe: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      google: false,
      googleicons: false,
    },
    families: lorealFamilies,
  },

  icon: {
    mode: 'svg',
    customCollections: [
      {
        prefix: 'amplif',
        dir: resolve('./app/assets/fonts/icon'),
      },
    ],
  },
})
