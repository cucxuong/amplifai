export const useCurrentUserStore = defineStore('currentUser', () => {
  const scheduleIds = useLocalStorage<string[]>('amplifai:schedule', [])

  function hasSchedule(id: string): boolean {
    return scheduleIds.value.includes(id)
  }

  function addToSchedule(id: string) {
    if (!hasSchedule(id))
      scheduleIds.value.push(id)
  }

  function removeFromSchedule(id: string) {
    scheduleIds.value = scheduleIds.value.filter(i => i !== id)
  }

  function toggleSchedule(id: string) {
    if (hasSchedule(id))
      removeFromSchedule(id)
    else addToSchedule(id)
  }

  function clearSchedule() {
    scheduleIds.value = []
  }

  return {
    scheduleIds,
    hasSchedule,
    addToSchedule,
    removeFromSchedule,
    toggleSchedule,
    clearSchedule,
  }
})
