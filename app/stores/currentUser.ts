export const useCurrentUserStore = defineStore('currentUser', () => {
  const scheduleIds = useLocalStorage<string[]>('amplifai:schedule', [])

  function hasSchedule(id: string): boolean {
    return scheduleIds.value.includes(id)
  }

  async function addToSchedule(id: string) {
    if (!hasSchedule(id)) {
      scheduleIds.value.push(id)
      // Call API to save to backend
      try {
        await $fetch('/api/minisite/schedule/add', {
          method: 'POST',
          body: { sessionId: id },
        })
      }
      catch (error) {
        console.error('Failed to add session to backend schedule:', error)
        // Remove from local storage if API call fails
        scheduleIds.value = scheduleIds.value.filter(i => i !== id)
        throw error
      }
    }
  }

  async function removeFromSchedule(id: string) {
    const hadSchedule = hasSchedule(id)
    scheduleIds.value = scheduleIds.value.filter(i => i !== id)

    // Call API to remove from backend
    if (hadSchedule) {
      try {
        await $fetch('/api/minisite/schedule/remove', {
          method: 'POST',
          body: { sessionId: id },
        })
      }
      catch (error) {
        console.error('Failed to remove session from backend schedule:', error)
        // Add back to local storage if API call fails
        scheduleIds.value.push(id)
        throw error
      }
    }
  }

  async function toggleSchedule(id: string) {
    if (hasSchedule(id))
      await removeFromSchedule(id)
    else await addToSchedule(id)
  }

  function clearSchedule() {
    scheduleIds.value = []
  }

  async function syncScheduleFromBackend() {
    try {
      const response = await $fetch<{ sessionIds: string[] }>('/api/minisite/schedule', {
        method: 'GET',
      })
      if (response?.sessionIds) {
        scheduleIds.value = response.sessionIds
      }
    }
    catch (error) {
      console.error('Failed to sync schedule from backend:', error)
      // Don't throw - continue with local storage
    }
  }

  return {
    scheduleIds,
    hasSchedule,
    addToSchedule,
    removeFromSchedule,
    toggleSchedule,
    clearSchedule,
    syncScheduleFromBackend,
  }
})
