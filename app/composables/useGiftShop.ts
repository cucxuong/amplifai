export function useGiftShop() {
  const productsStore = useProductsStore()
  const ordersStore = useOrdersStore()

  onMounted(() => {
    void productsStore.fetchProducts()
  })

  return {
    products: computed(() => productsStore.items),
    orders: computed(() => ordersStore.items),
    loading: computed(() => productsStore.loading || ordersStore.loading),
    refreshProducts: productsStore.fetchProducts,
    fetchOrders: ordersStore.fetchOrders,
    redeemOrder: ordersStore.redeemOrder,
  }
}
