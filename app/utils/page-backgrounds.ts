/** IPX tweaks: ~2× `max-w-md` (448px), WebP cover. */
export const PAGE_BG_MODIFIERS = {
  width: 896,
  format: 'webp',
  quality: 80,
  fit: 'cover',
} as const

export const PAGE_BG_SOURCES = [
  '/slash.png',
  '/sign-in.png',
  '/pick-persona.png',
] as const

export type PageBackgroundSource = (typeof PAGE_BG_SOURCES)[number]

export interface PageBackgroundState {
  loggedIn: boolean
  onboardingComplete: boolean
}

export const LEADER_BOARD_BACKGROUND =
  'linear-gradient(180deg, #000 0%, #0021A5 100%)'

/** Figma Gift tab — black to deep royal blue */
export const GIFT_PAGE_BACKGROUND = LEADER_BOARD_BACKGROUND

/** Figma Scan QR code screen — full black body behind #scan-qr-page */
export const SCAN_PAGE_BACKGROUND = '#000000'

export type PageBackgroundConfig =
  | { kind: 'image'; src: PageBackgroundSource }
  | { kind: 'gradient'; background: string }
  | { kind: 'solid'; color: string }

export type PageBackgroundUrlBuilder = (
  src: PageBackgroundSource,
  modifiers?: typeof PAGE_BG_MODIFIERS,
) => string

export function toPageBackgroundUrl(
  img: PageBackgroundUrlBuilder,
  src: PageBackgroundSource,
) {
  return img(src, PAGE_BG_MODIFIERS)
}

/** Match index.vue branching + `/sign-in`. CSS still sets positions via `:has(...)`. */
export function resolvePageBackground(
  routePath: string,
  state: PageBackgroundState,
): PageBackgroundConfig {
  if (routePath.startsWith('/scan'))
    return { kind: 'solid', color: SCAN_PAGE_BACKGROUND }
  if (routePath.startsWith('/leader-board'))
    return { kind: 'gradient', background: LEADER_BOARD_BACKGROUND }
  if (routePath.startsWith('/gift'))
    return { kind: 'gradient', background: GIFT_PAGE_BACKGROUND }
  if (routePath.startsWith('/sign-in') || routePath.startsWith('/sign-up'))
    return { kind: 'image', src: '/sign-in.png' }
  if (!state.loggedIn)
    return { kind: 'image', src: '/slash.png' }
  if (!state.onboardingComplete)
    return { kind: 'image', src: '/pick-persona.png' }
  if (
    routePath === '/agenda'
    || routePath.startsWith('/me')
    || routePath === '/'
  )
    return { kind: 'image', src: '/sign-in.png' }
  return { kind: 'image', src: '/sign-in.png' }
}

/** Backgrounds likely needed on the next navigation or session transition. */
export function getLikelyNextPageBackgroundSrcs(
  routePath: string,
  state: PageBackgroundState,
): PageBackgroundSource[] {
  if (routePath.startsWith('/scan'))
    return []
  if (routePath.startsWith('/leader-board') || routePath.startsWith('/gift'))
    return ['/sign-in.png']
  if (routePath.startsWith('/sign-in') || routePath.startsWith('/sign-up'))
    return ['/pick-persona.png', '/sign-in.png']
  if (!state.loggedIn)
    return ['/sign-in.png']
  if (!state.onboardingComplete)
    return ['/sign-in.png']
  if (routePath === '/agenda' || routePath.startsWith('/me'))
    return ['/sign-in.png']
  return []
}

const warmedBackgroundUrls = new Set<string>()
const preloadedBackgroundUrls = new Set<string>()

/** Client cache warm: link hint + decode via Image. */
export function warmPageBackgroundUrl(
  href: string,
  priority: 'preload' | 'prefetch' = 'prefetch',
) {
  if (import.meta.server)
    return

  if (priority === 'preload' && !preloadedBackgroundUrls.has(href)) {
    preloadedBackgroundUrls.add(href)
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = href
    link.fetchPriority = 'high'
    document.head.appendChild(link)
  }

  if (warmedBackgroundUrls.has(href))
    return

  warmedBackgroundUrls.add(href)

  const image = new Image()
  image.decoding = 'async'
  image.src = href
}
