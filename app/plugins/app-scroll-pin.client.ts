export default defineNuxtPlugin({
  name: 'app-scroll-pin',
  enforce: 'pre',
  async setup() {
    const { ensureScrollPinned, syncReadyFromDom } = useAppScrollPin()
    const router = useRouter()

    syncReadyFromDom()
    await ensureScrollPinned()

    router.beforeEach(async (to, from) => {
      if (to.path === from.path)
        return
      await ensureScrollPinned()
    })
  },
})
