export function useMinisiteAuth() {
  const { loggedIn, session, user, clear } = useUserSession()
  const userStore = useUserStore()

  async function fetchMe() {
    if (!loggedIn.value)
      return null
    return userStore.fetchMe()
  }

  async function updateProfile(body: { persona?: string, firstName?: string, lastName?: string }) {
    const profile = await userStore.updateProfile(body)
    if (body.persona !== undefined) {
      await $fetch('/api/user/onboarding', {
        method: 'POST',
        body: { personaId: body.persona, onboardingComplete: true },
      })
      await refreshAuthSession()
    }
    return profile
  }

  async function completeOnboarding(body: { personaId?: string, skip?: boolean }) {
    if (body.skip) {
      await $fetch('/api/user/onboarding', {
        method: 'POST',
        body: { skip: true },
      })
      await refreshAuthSession()
      return
    }
    if (body.personaId) {
      const token = typeof session.value?.minisiteToken === 'string' ? session.value.minisiteToken : ''
      if (token)
        await updateProfile({ persona: body.personaId })
      else {
        await $fetch('/api/user/onboarding', {
          method: 'POST',
          body: { personaId: body.personaId, onboardingComplete: true },
        })
        await refreshAuthSession()
      }
    }
  }

  return {
    loggedIn,
    session,
    user,
    clear,
    profile: computed(() => userStore.profile),
    sparks: computed(() => userStore.sparks),
    rank: computed(() => userStore.rank),
    fetchMe,
    updateProfile,
    completeOnboarding,
  }
}
