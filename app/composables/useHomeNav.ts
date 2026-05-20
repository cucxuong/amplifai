export enum AppNav {
  AGENDA = 'AGENDA',
  GIFT = 'GIFT',
  SCAN = 'SCAN',
  ME = 'ME',
}

export const APP_NAV_ITEMS = [
  {
    name: AppNav.AGENDA,
    icon: 'amplif:calendar-2',
    label: 'Agenda',
  },
  {
    name: AppNav.GIFT,
    icon: 'amplif:gift',
    label: 'Gift',
  },
  {
    name: AppNav.SCAN,
    icon: 'amplif:scan-bold',
    label: 'Scan',
  },
  {
    name: AppNav.ME,
    icon: 'amplif:profile',
    label: 'Me',
  },
] as const

function isSignedInShellRoute(path: string) {
  return path === '/agenda'
    || path.startsWith('/me')
    || path.startsWith('/gift')
}

export function useHomeNav() {
  const route = useRoute()

  const activeTab = computed(() => {
    if (route.path.startsWith('/me')) return AppNav.ME
    if (route.path.startsWith('/scan')) return AppNav.SCAN
    if (route.path.startsWith('/gift')) return AppNav.GIFT
    if (route.path.startsWith('/agenda') || route.path === '/') return AppNav.AGENDA
    return AppNav.AGENDA
  })

  return {
    activeTab,
    APP_NAV_ITEMS,
    isSignedInShellRoute,
  }
}
