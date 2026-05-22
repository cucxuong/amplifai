export const useCurrentUserStore = defineStore('currentUser', () => {
  // Keep local cache for quick UI updates
  const scheduleIds = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSchedule() {
    try {
      loading.value = true
      error.value = null
      const api = useApi()
      const response = await api.get<{ sessionIds: string[] }>('/api/minisite/schedule')
      scheduleIds.value = response.sessionIds || []
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch schedule'
      console.error('Error fetching schedule:', e)
    }
    finally {
      loading.value = false
    }
  }

  function hasSchedule(id: string): boolean {
    return scheduleIds.value.includes(id)
  }

  async function addToSchedule(id: string) {
    if (hasSchedule(id))
      return

    // Optimistic update
    scheduleIds.value.push(id)

    try {
      const api = useApi()
      await api.post('/api/minisite/schedule/add', { sessionId: id })
    }
    catch (e) {
      // Revert optimistic update on error
      scheduleIds.value = scheduleIds.value.filter(i => i !== id)
      error.value = e instanceof Error ? e.message : 'Failed to save to schedule'
      console.error('Error adding to schedule:', e)
      throw e
    }
  }

  async function removeFromSchedule(id: string) {
    // Optimistic update
    scheduleIds.value = scheduleIds.value.filter(i => i !== id)

    try {
      const api = useApi()
      await api.post('/api/minisite/schedule/remove', { sessionId: id })
    }
    catch (e) {
      // Revert optimistic update on error - refetch from server
      await fetchSchedule()
      error.value = e instanceof Error ? e.message : 'Failed to remove from schedule'
      console.error('Error removing from schedule:', e)
      throw e
    }
  }

  function toggleSchedule(id: string) {
    if (hasSchedule(id))
      return removeFromSchedule(id)
    else
      return addToSchedule(id)
  }

  function clearSchedule() {
    scheduleIds.value = []
  }

  return {
    scheduleIds,
    loading,
    error,
    hasSchedule,
    addToSchedule,
    removeFromSchedule,
    toggleSchedule,
    clearSchedule,
    fetchSchedule,
  }
})
