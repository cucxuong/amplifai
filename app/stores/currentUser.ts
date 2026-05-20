export const useCurrentUserStore = defineStore('currentUser', () => {
  const scheduleIds = ref<string[]>([])

  const email = ref<string | undefined>()
  const name = ref<string | undefined>()
  const personaId = ref<string | null | undefined>()

  function syncFromSession() {
    const { user, session } = useUserSession()
    email.value = user.value?.email
    name.value = user.value?.name
    personaId.value = session.value?.personaId
  }

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

  const scheduleCount = computed(() => scheduleIds.value.length)

  return {
    scheduleIds,
    email,
    name,
    personaId,
    syncFromSession,
    hasSchedule,
    addToSchedule,
    removeFromSchedule,
    toggleSchedule,
    clearSchedule,
    scheduleCount,
  }
})
