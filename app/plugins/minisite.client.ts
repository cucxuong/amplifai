export default defineNuxtPlugin(async () => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value)
    return

  const userStore = useUserStore()
  const agendaStore = useAgendaStore()
  const [meResult] = await Promise.allSettled([
    userStore.fetchMe(),
    agendaStore.fetchSessions(),
  ])

  if (meResult.status === 'rejected' && isUnauthorizedError(meResult.reason))
    useMinisiteStatus().markUnavailable()
})
