export function useLeaderboard() {
  const store = useLeaderboardStore()

  onMounted(() => {
    void store.fetchLeaderboard()
  })

  return {
    rows: computed(() => store.rows),
    myRank: computed(() => store.myRank),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    refresh: store.fetchLeaderboard,
  }
}
