import type { MinisiteLeaderboardResponse } from '#shared/types/minisite'
import { mapLeaderboardEntry } from '~/utils/api/mappers/minisite'

export const useLeaderboardStore = defineStore('leaderboard', () => {
  const data = ref<MinisiteLeaderboardResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const rows = computed(() => {
    if (!data.value)
      return []
    const userId = useUserStore().profile?.userId
    return data.value.leaderboard.map(entry => mapLeaderboardEntry(entry, userId))
  })

  const myRank = computed(() => data.value?.myRank ?? null)

  async function fetchLeaderboard(limit = 50) {
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      data.value = await api.get<MinisiteLeaderboardResponse>('/api/minisite/leaderboard', { limit })
    }
    catch (e) {
      if (isUnauthorizedError(e))
        useMinisiteStatus().markUnavailable()
      error.value = e instanceof Error ? e.message : 'Failed to load leaderboard'
    }
    finally {
      loading.value = false
    }
  }

  return {
    data,
    rows,
    myRank,
    loading,
    error,
    fetchLeaderboard,
  }
})
