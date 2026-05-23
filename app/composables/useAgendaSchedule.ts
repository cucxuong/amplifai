/**
 * Bridges agenda catalog (useAgendaStore) and user's calendar IDs (useCurrentUserStore).
 */
export function useAgendaSchedule() {
  const agenda = useAgendaStore()
  const currentUser = useCurrentUserStore()

  onMounted(() => {
    void agenda.fetchSessions()
    void currentUser.syncScheduleFromBackend()
  })

  function isInUserCalendar(itemOrId: AgendaItem | string): boolean {
    const id = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
    return currentUser.hasSchedule(id)
  }

  function agendaItemsForView(tab: 'all' | 'my-schedule', date: string | null): AgendaItem[] {
    // Get items by date (or all if date is null for always-on items)
    const byDate = agenda.itemsByDate(date)

    if (tab === 'my-schedule') {
      // For "my-schedule", filter date-based items by saved sessions
      return byDate.filter(i => isInUserCalendar(i))
    }
    // For "all" tab, return all items for the selected date
    return byDate
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
  }
}
