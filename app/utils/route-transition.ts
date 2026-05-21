export type NavigationIntent = 'forward' | 'back' | null

export type PageTransitionName =
  | 'agenda-scale'
  | 'fade-scale-in'
  | 'fade-scale-out'
  | 'slide-left'
  | 'slide-right'

type TransitionFamily = 'agenda-scale' | 'fade-scale' | 'slide'

/** NavBar tab order: agenda → gift → scan → me */
const TAB_ROUTE_INDEX: Record<string, number> = {
  '/agenda': 0,
  '/': 0,
  '/gift': 1,
  '/scan': 2,
  '/me': 3,
}

function isAgendaHome(path: string) {
  return path === '/agenda'
}

function isEventDetailPath(path: string) {
  return /^\/agenda\/[^/]+$/.test(path)
}

function transitionFamily(path: string): TransitionFamily {
  if (isAgendaHome(path))
    return 'agenda-scale'

  if (
    path.startsWith('/leader-board')
    || path.startsWith('/sparks')
  ) {
    return 'fade-scale'
  }

  if (
    isEventDetailPath(path)
    || path.startsWith('/pick-persona')
    || path.startsWith('/gift')
    || path.startsWith('/me')
    || path.startsWith('/scan')
  ) {
    return 'slide'
  }

  return 'agenda-scale'
}

function tabIndex(path: string): number | null {
  if (path === '/' || isAgendaHome(path))
    return TAB_ROUTE_INDEX['/agenda']!
  if (path.startsWith('/gift'))
    return TAB_ROUTE_INDEX['/gift']!
  if (path.startsWith('/scan'))
    return TAB_ROUTE_INDEX['/scan']!
  if (path.startsWith('/me'))
    return TAB_ROUTE_INDEX['/me']!
  return null
}

export function routeDepth(path: string): number {
  return path.split('/').filter(Boolean).length
}

function isBackward(from: string, to: string, intent: NavigationIntent): boolean {
  if (intent === 'back')
    return true
  if (intent === 'forward')
    return false

  const fromTab = tabIndex(from)
  const toTab = tabIndex(to)
  if (fromTab !== null && toTab !== null && fromTab !== toTab)
    return toTab < fromTab

  return routeDepth(to) < routeDepth(from)
}

function resolveSlideTransition(
  from: string,
  to: string,
  intent: NavigationIntent,
): 'slide-left' | 'slide-right' {
  if (isBackward(from, to, intent))
    return 'slide-right'
  return 'slide-left'
}

function resolveFadeScaleTransition(
  from: string,
  to: string,
  intent: NavigationIntent,
): 'fade-scale-in' | 'fade-scale-out' {
  if (isBackward(from, to, intent))
    return 'fade-scale-out'
  return 'fade-scale-in'
}

/** Agenda involved in nav → same scale anim either direction. Else incoming route picks family. */
export function resolvePageTransition(
  from: string,
  to: string,
  intent: NavigationIntent,
): PageTransitionName {
  if (isAgendaHome(from) || isAgendaHome(to))
    return 'agenda-scale'

  const family = transitionFamily(to)

  if (family === 'agenda-scale')
    return 'agenda-scale'

  if (family === 'fade-scale')
    return resolveFadeScaleTransition(from, to, intent)

  return resolveSlideTransition(from, to, intent)
}
