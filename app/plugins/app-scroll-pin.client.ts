export default defineNuxtPlugin(() => {
  const { ensureScrollPinned } = useAppScrollPin()
  const router = useRouter()

  void ensureScrollPinned()

  router.beforeEach(async (to, from) => {
    if (to.path === from.path)
      return
    await ensureScrollPinned()
  })
})
