import type { MinisiteProduct } from '#shared/types/minisite'

export const useProductsStore = defineStore('products', () => {
  const items = ref<MinisiteProduct[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProducts(category?: string) {
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      items.value = await api.get<MinisiteProduct[]>('/api/minisite/products', category ? { category } : undefined)
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load products'
    }
    finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    error,
    fetchProducts,
  }
})
