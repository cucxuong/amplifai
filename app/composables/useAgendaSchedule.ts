/**
 * Bridges agenda catalog (useAgendaStore) and user's calendar IDs (useCurrentUserStore).
 */
export function useAgendaSchedule() {
  const agenda = useAgendaStore()
  const currentUser = useCurrentUserStore()

  currentUser.seedScheduleFromAgenda(agenda.items)

  onMounted(() => currentUser.syncFromSession())

  function isInUserCalendar(itemOrId: AgendaItem | string): boolean {
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
    return currentUser.hasSchedule(id)
  }

  function agendaItemsForView(tab: 'all' | 'my-schedule', date: string | null): AgendaItem[] {
    const byDate = agenda.itemsByDate(date)
    if (tab === 'all')
      return byDate
    return byDate.filter(i => isInUserCalendar(i))
  }

  const scheduledItems = computed(() =>
    agenda.items.filter(i => currentUser.hasSchedule(i.id)),
  )

  return {
    isAgendaItemLive,
    isInUserCalendar,
    agendaItemsForView,
    scheduledItems,
    addToSchedule: currentUser.addToSchedule,
    removeFromSchedule: currentUser.removeFromSchedule,
    toggleSchedule: currentUser.toggleSchedule,
    syncScheduleFromSession: currentUser.syncFromSession,
  }
}
