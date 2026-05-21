import type { MinisiteMeResponse } from '#shared/types/minisite'
import { mapMeProfile } from '~/utils/api/mappers/minisite'

export const useUserStore = defineStore('user', () => {
  const profile = ref<ReturnType<typeof mapMeProfile> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sparks = computed(() => profile.value?.sparks ?? 0)
  const rank = computed(() => profile.value?.rank ?? null)
  const recentActivity = computed(() => profile.value?.recentActivity ?? [])

  async function fetchMe(force = false) {
    if (profile.value && !force)
      return profile.value
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      const data = await api.get<MinisiteMeResponse>('/api/minisite/me')
      profile.value = mapMeProfile(data)
      useMinisiteStatus().clearUnavailable()
      return profile.value
    }
    catch (e) {
      if (isUnauthorizedError(e))
        useMinisiteStatus().markUnavailable()
      error.value = e instanceof Error ? e.message : 'Failed to load profile'
      return null
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    profile.value = null
    loading.value = false
    error.value = null
  }

  async function updateProfile(body: { persona?: string, firstName?: string, lastName?: string }) {
    const api = useApi()
    error.value = null
    try {
      await api.patch('/api/minisite/me', body)
      return fetchMe(true)
    }
    catch (e) {
      if (isUnauthorizedError(e))
        useMinisiteStatus().markUnavailable()
      error.value = e instanceof Error ? e.message : 'Failed to update profile'
      throw e
    }
  }

  return {
    profile,
    loading,
    error,
    sparks,
    rank,
    recentActivity,
    fetchMe,
    updateProfile,
    reset,
  }
})
