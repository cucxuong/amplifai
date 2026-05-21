import type { MinisiteOrder, MinisitePaginatedEnvelope  } from '#shared/types/minisite'

export const useOrdersStore = defineStore('orders', () => {
  const items = ref<MinisiteOrder[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrders(page = 1) {
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      const res = await api.get<MinisitePaginatedEnvelope<MinisiteOrder>>('/api/minisite/orders', { page })
      items.value = res.data ?? []
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load orders'
    }
    finally {
      loading.value = false
    }
  }

  async function redeemOrder(shortId: string) {
    const api = useApi()
    return api.post<{ currentSparks: number }>('/api/minisite/orders/redeem', { shortId })
  }

  return {
    items,
    loading,
    error,
    fetchOrders,
    redeemOrder,
  }
})
