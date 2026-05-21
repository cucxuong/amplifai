import type { MinisiteCheckInResult, MinisiteQrRedeemResult } from '#shared/types/minisite'

export interface CheckInSuccess {
  title: string
  sparks: number
  routeId: string
}

export const useCheckInStore = defineStore('checkIn', () => {
  const lastSuccess = ref<CheckInSuccess | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function checkInByQr(qrCode: string): Promise<CheckInSuccess | null> {
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      const result = await api.post<MinisiteCheckInResult>('/api/minisite/check-in', { qrCode })
      const agendaStore = useAgendaStore()
      const item = agendaStore.items.find(i => i.title === result.sessionTitle)
      const success: CheckInSuccess = {
        title: result.sessionTitle,
        sparks: result.sparksAwarded,
        routeId: item?.id ?? qrCode,
      }
      lastSuccess.value = success
      await useUserStore().fetchMe(true)
      void agendaStore.fetchSessions(true)
      return success
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Check-in failed'
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function redeemCampaignQr(qrCode: string): Promise<CheckInSuccess | null> {
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      const result = await api.post<MinisiteQrRedeemResult>('/api/minisite/qr/redeem', { qrCode })
      const success: CheckInSuccess = {
        title: result.title,
        sparks: result.amount,
        routeId: qrCode.toUpperCase(),
      }
      lastSuccess.value = success
      await useUserStore().fetchMe(true)
      return success
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'QR redeem failed'
      return null
    }
    finally {
      loading.value = false
    }
  }

  async function redeemOrderByShortId(shortId: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      await api.post<{ currentSparks: number }>('/api/minisite/orders/redeem', { shortId })
      await useUserStore().fetchMe(true)
      return true
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Order redeem failed'
      return false
    }
    finally {
      loading.value = false
    }
  }

  return {
    lastSuccess,
    loading,
    error,
    checkInByQr,
    redeemCampaignQr,
    redeemOrderByShortId,
  }
})
