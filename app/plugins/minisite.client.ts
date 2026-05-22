export default defineNuxtPlugin(async () => {
  const { loggedIn, session } = useUserSession()
  if (!loggedIn.value)
    return

  const userStore = useUserStore()
  const agendaStore = useAgendaStore()
  await agendaStore.fetchSessions()

  const token = session.value?.minisiteToken
  if (typeof token === 'string' && token)
    await userStore.fetchMe()
})
