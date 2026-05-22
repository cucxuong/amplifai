import { getMinScrollTop, pinScrollSync } from '~/utils/app-scroll-pin'

const MAX_PIN_FRAMES = 4

export function useAppScrollPin() {
  const scrollPinReady = useState('appScrollPinReady', () => false)
  const { y: scrollY } = useWindowScroll({ behavior: 'instant' })

  function syncScrollY(top: number) {
    if (scrollY.value !== top)
      scrollY.value = top
  }

  async function ensureScrollPinned(): Promise<void> {
    if (import.meta.server)
      return

    scrollPinReady.value = false
    const target = pinScrollSync()
    syncScrollY(target)

    await new Promise<void>((resolve) => {
      let attempts = 0

      const verify = () => {
        const top = pinScrollSync()
        syncScrollY(top)

        if (Math.abs(window.scrollY - target) < 1 || attempts >= MAX_PIN_FRAMES) {
          scrollPinReady.value = true
          resolve()
          return
        }

        attempts++
        requestAnimationFrame(verify)
      }

      requestAnimationFrame(verify)
    })
  }

  return {
    scrollPinReady: computed(() => scrollPinReady.value),
    getMinScrollTop,
    pinScrollSync,
    ensureScrollPinned,
    scrollY,
  }
}
