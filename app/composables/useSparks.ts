export function useSparks() {
  const userStore = useUserStore()
  const { fetchMe } = useMinisiteAuth()

  onMounted(() => {
    void fetchMe()
  })

  const totalEarned = computed(() => {
    const earned = userStore.recentActivity
      .filter(a => a.sparks > 0)
      .reduce((sum, a) => sum + a.sparks, 0)
    return earned || userStore.sparks
  })

  return {
    activities: computed(() => userStore.recentActivity),
    currentScore: computed(() => userStore.sparks),
    totalEarned,
    rank: computed(() => userStore.rank),
    loading: computed(() => userStore.loading),
    error: computed(() => userStore.error),
    refresh: fetchMe,
  }
}
