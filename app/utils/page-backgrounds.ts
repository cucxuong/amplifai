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

export interface PageBackgroundConfig {
  src: PageBackgroundSource
}

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
  if (routePath.startsWith('/sign-in'))
    return { src: '/sign-in.png' }
  if (!state.loggedIn)
    return { src: '/slash.png' }
  if (!state.onboardingComplete)
    return { src: '/pick-persona.png' }
  return { src: '/sign-in.png' }
}

/** Backgrounds likely needed on the next navigation or session transition. */
export function getLikelyNextPageBackgroundSrcs(
  routePath: string,
  state: PageBackgroundState,
): PageBackgroundSource[] {
  if (routePath.startsWith('/sign-in'))
    return ['/pick-persona.png', '/sign-in.png']
  if (!state.loggedIn)
    return ['/sign-in.png']
  if (!state.onboardingComplete)
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
