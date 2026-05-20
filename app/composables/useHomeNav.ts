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

export function useHomeNav() {
  const activeTab = useState<AppNav>('activeTab', () => AppNav.AGENDA )

  return {
    activeTab,
    APP_NAV_ITEMS,
  }
}
