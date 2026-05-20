import type { RouteLocationNormalized } from 'vue-router'

export type ViewTransitionZone = 'shell' | 'stack' | 'auth' | 'fade' | 'none'

const SHELL_PATHS = ['/agenda', '/me', '/gift'] as const
const SHELL_TAB_ORDER: Record<string, number> = {
  '/agenda': 0,
  '/me': 1,
  '/gift': 2,
}

/** Routes that push on top of shell (slide). */
function isStackPath(path: string) {
  if (path.startsWith('/agenda/') && path !== '/agenda/')
    return path.length > '/agenda/'.length
  return (
    path === '/sparks'
    || path.startsWith('/sparks/')
    || path === '/leader-board'
    || path.startsWith('/leader-board/')
    || path.startsWith('/scan')
  )
}

function isShellPath(path: string) {
  return (SHELL_PATHS as readonly string[]).includes(path)
}

function routeDepth(path: string) {
  return path.split('/').filter(Boolean).length
}

export function getViewTransitionZone(path: string): ViewTransitionZone {
  if (
    path === '/sign-in'
    || path.startsWith('/sign-in/')
    || path === '/sign-up'
    || path.startsWith('/sign-up/')
    || path === '/'
    || path.startsWith('/pick-persona')
  )
    return 'auth'
  if (path.startsWith('/scan') || path.startsWith('/checkin'))
    return 'fade'
  if (isShellPath(path))
    return 'shell'
  if (isStackPath(path))
    return 'stack'
  return 'fade'
}

export function isForwardNavigation(
  from: RouteLocationNormalized,
  to: RouteLocationNormalized,
) {
  const intent = useState<'forward' | 'back' | null>('navigationIntent', () => null)
  if (intent.value === 'back') {
    intent.value = null
    return false
  }
  if (intent.value === 'forward') {
    intent.value = null
    return true
  }

  const fromPath = from.path
  const toPath = to.path

  if (isShellPath(fromPath) && isShellPath(toPath)) {
    const fromIdx = SHELL_TAB_ORDER[fromPath] ?? 0
    const toIdx = SHELL_TAB_ORDER[toPath] ?? 0
    return toIdx > fromIdx
  }

  if (isShellPath(fromPath) && isStackPath(toPath))
    return true

  if (isStackPath(fromPath) && isShellPath(toPath))
    return false

  if (isStackPath(fromPath) && isStackPath(toPath))
    return routeDepth(toPath) >= routeDepth(fromPath)

  return routeDepth(toPath) > routeDepth(fromPath)
}

function stackDirectionTypes(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) {
  return isForwardNavigation(from, to) ? ['slide-in'] : ['slide-out']
}

/** Shell tab switches — short crossfade, no slide. */
export const shellViewTransition = {
  enabled: true,
  types: ['fade'],
  toTypes: () => ['fade'],
  fromTypes: () => ['fade'],
} as const

/** Stack push/pop (detail, sparks, scan, leaderboard). */
export const stackViewTransition = {
  enabled: true,
  types: ['slide'],
  toTypes: stackDirectionTypes,
  fromTypes: stackDirectionTypes,
} as const

/** Auth / sign-in — always slide in when arriving. */
export const authViewTransition = {
  enabled: true,
  types: ['slide'],
  toTypes: () => ['slide-in'],
  fromTypes: () => ['slide-out'],
} as const

/** Scan / check-in — crossfade only. */
export const fadeViewTransition = {
  enabled: true,
  types: ['fade'],
  toTypes: () => ['fade'],
  fromTypes: () => ['fade'],
} as const

export const noViewTransition = {
  enabled: false,
} as const

export function viewTransitionForPath(path: string) {
  const zone = getViewTransitionZone(path)
  switch (zone) {
    case 'shell':
      return shellViewTransition
    case 'stack':
      return stackViewTransition
    case 'auth':
      return authViewTransition
    case 'fade':
      return fadeViewTransition
    case 'none':
      return noViewTransition
  }
}
