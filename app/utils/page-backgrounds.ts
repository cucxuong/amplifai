export type PageBackgroundLayoutKey =
  | 'slash'
  | 'agenda'
  | 'auth'
  | 'signup'
  | 'persona'
  | 'sparks'
  | 'eventDetail'
  | 'me'

export type PageBackgroundSource = '/slash.png' | '/global-bg.png'

export const PAGE_BG_SOURCES: PageBackgroundSource[] = [
  '/slash.png',
  '/global-bg.png',
]

export type PageBackgroundConfig =
  | { kind: 'image', src: PageBackgroundSource, layoutKey: PageBackgroundLayoutKey }
  | { kind: 'gradient', css: string }
  | { kind: 'solid', color: string }

export type PageBackgroundState = {
  loggedIn: boolean
  onboardingComplete: boolean
}

const AUTH_GRADIENT_OVERLAY
  = 'linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.50) 100%)'

export { AUTH_GRADIENT_OVERLAY }

export const LEADER_BOARD_BACKGROUND
  = 'linear-gradient(180deg, #000 0%, #0021A5 100%)'

/** Per-route background-position for shared global-bg.png */
export const PAGE_BG_BODY_POSITIONS: Record<PageBackgroundLayoutKey, string> = {
  slash: 'top right',
  agenda: '30% 0%',
  auth: '30% 0%',
  signup: '30% 0%',
  persona: '0% 0%',
  sparks: '0% 0%',
  eventDetail: '0% 0%',
  me: '0% 0%',
}

const PAGE_BG_OVERLAY: Record<PageBackgroundLayoutKey, boolean> = {
  slash: true,
  agenda: true,
  auth: true,
  signup: true,
  persona: true,
  sparks: true,
  eventDetail: true,
  me: true,
}

function imageConfig(
  src: PageBackgroundSource,
  layoutKey: PageBackgroundLayoutKey,
): PageBackgroundConfig {
  return { kind: 'image', src, layoutKey }
}

function isEventDetailPath(routePath: string) {
  return /^\/agenda\/[^/]+$/.test(routePath)
}

function isAgendaHome(routePath: string) {
  return routePath === '/agenda'
}

/** Exact route → background mapping. */
export function resolvePageBackground(
  routePath: string,
  state: PageBackgroundState,
): PageBackgroundConfig {
  if (routePath.startsWith('/scan'))
    return { kind: 'solid', color: '#000' }

  if (
    routePath.startsWith('/leader-board')
    || routePath.startsWith('/gift')
  ) {
    return { kind: 'gradient', css: LEADER_BOARD_BACKGROUND }
  }

  if (routePath.startsWith('/sign-in'))
    return imageConfig('/global-bg.png', 'auth')

  if (routePath.startsWith('/sign-up'))
    return imageConfig('/global-bg.png', 'signup')

  if (routePath.startsWith('/pick-persona'))
    return imageConfig('/global-bg.png', 'persona')

  if (routePath.startsWith('/sparks'))
    return imageConfig('/global-bg.png', 'sparks')

  if (routePath.startsWith('/me'))
    return imageConfig('/global-bg.png', 'me')

  if (isEventDetailPath(routePath))
    return imageConfig('/global-bg.png', 'eventDetail')

  if (isAgendaHome(routePath))
    return imageConfig('/global-bg.png', 'agenda')

  if (routePath === '/' && state.loggedIn)
    return imageConfig('/global-bg.png', 'agenda')

  if (routePath === '/' && !state.loggedIn)
    return imageConfig('/slash.png', 'slash')

  return { kind: 'solid', color: '#000' }
}

export function resolvePageBackgroundImageSrc(
  routePath: string,
  state: PageBackgroundState,
): PageBackgroundSource | null {
  const config = resolvePageBackground(routePath, state)
  return config.kind === 'image' ? config.src : null
}

export function toRawPageBackgroundUrl(src: PageBackgroundSource): string {
  return src
}

export type BodyBackgroundProps = {
  backgroundImage: string
  backgroundSize: string
  backgroundPosition: string
  backgroundRepeat: string
  backgroundColor: string
}

export function backgroundConfigKey(config: PageBackgroundConfig): string {
  if (config.kind === 'solid')
    return `solid:${config.color}`
  if (config.kind === 'gradient')
    return `gradient:${config.css}`
  return `image:${config.src}:${config.layoutKey}`
}

export function toBodyBackgroundProps(
  config: PageBackgroundConfig,
  imageUrl: string | null,
): BodyBackgroundProps {
  if (config.kind === 'gradient') {
    return {
      backgroundImage: config.css,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#000',
    }
  }

  if (config.kind === 'solid') {
    return {
      backgroundImage: 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: config.color,
    }
  }

  if (!imageUrl) {
    return {
      backgroundImage: 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#000',
    }
  }

  const position = PAGE_BG_BODY_POSITIONS[config.layoutKey]
  const layers: string[] = []

  // Keep global-bg layer stack identical on every route so only position animates.
  const useOverlay = config.src === '/global-bg.png' || PAGE_BG_OVERLAY[config.layoutKey]
  if (useOverlay)
    layers.push(AUTH_GRADIENT_OVERLAY)

  layers.push(`url("${imageUrl}")`)

  const layerCount = layers.length

  return {
    backgroundImage: layers.join(','),
    backgroundSize: Array(layerCount).fill('cover').join(','),
    backgroundPosition: Array(layerCount).fill(position).join(','),
    backgroundRepeat: Array(layerCount).fill('no-repeat').join(','),
    backgroundColor: '#000',
  }
}

const BODY_BG_PROP_KEYS: (keyof BodyBackgroundProps)[] = [
  'backgroundImage',
  'backgroundSize',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundColor',
]

function camelToKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

export function bodyBackgroundPropsToStyle(props: BodyBackgroundProps): string {
  return BODY_BG_PROP_KEYS
    .map(key => `${camelToKebab(key)}:${props[key]}`)
    .join(';')
}

export function toBodyBackgroundStyle(
  config: PageBackgroundConfig,
  imageUrl: string | null,
): string {
  return bodyBackgroundPropsToStyle(toBodyBackgroundProps(config, imageUrl))
}

export function warmPageBackgroundUrl(
  href: string,
  rel: 'preload' | 'prefetch' = 'prefetch',
) {
  if (!import.meta.client)
    return

  const selector = `link[rel="${rel}"][href="${href}"]`
  if (document.head.querySelector(selector))
    return

  const link = document.createElement('link')
  link.rel = rel
  link.as = 'image'
  link.href = href
  document.head.appendChild(link)
}

export function getAllPageBackgroundImageUrls(): string[] {
  return PAGE_BG_SOURCES.map(src => toRawPageBackgroundUrl(src))
}

let pageBackgroundImagesPreloaded = false

/** Eagerly cache + decode every page background image once per session. */
export function preloadAllPageBackgroundImages() {
  if (!import.meta.client || pageBackgroundImagesPreloaded)
    return

  pageBackgroundImagesPreloaded = true

  for (const href of getAllPageBackgroundImageUrls()) {
    warmPageBackgroundUrl(href, 'preload')

    const img = new Image()
    img.decoding = 'async'
    img.src = href
  }
}
