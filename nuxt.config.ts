import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

import { createResolver } from "nuxt/kit"

const { resolve } = createResolver(import.meta.url)

/** Paths under `app/assets/fonts/Loreal Fonts/Fonts/` */
const lorealFontRoot = new URL('./app/assets/fonts/Loreal Fonts/Fonts/', import.meta.url)

function lorealFontPath(rel: string) {
  return fileURLToPath(new URL(rel, lorealFontRoot))
}

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
  src: [{ url: lorealFontPath(rel), format }],
}))


// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: ['./app/assets/css/tailwind.css'],

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
      meta: [
        { name: 'theme-color', content: '#0021A5' },
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
