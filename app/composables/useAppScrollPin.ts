import { getMinScrollTop, pinScrollSync } from '~/utils/app-scroll-pin'

const MAX_PIN_FRAMES = 4

let pinPromise: Promise<void> | null = null
let firstClientPin = true

export function useAppScrollPin() {
  const scrollPinReady = useState('appScrollPinReady', () => false)
  const { y: scrollY } = useWindowScroll({ behavior: 'instant' })

  function syncScrollY(top: number) {
    if (scrollY.value !== top)
      scrollY.value = top
  }

  /** Restore ready flag from DOM — SSR payload always serializes false. */
  function syncReadyFromDom() {
    if (import.meta.client && document.documentElement.classList.contains('app-scroll-pinned'))
      scrollPinReady.value = true
  }

  async function ensureScrollPinned(): Promise<void> {
    if (import.meta.server)
      return

    if (pinPromise)
      return pinPromise

    pinPromise = (async () => {
      const alreadyPinned = document.documentElement.classList.contains('app-scroll-pinned')
      const skipHide = firstClientPin && alreadyPinned
      if (firstClientPin)
        firstClientPin = false

      if (!skipHide) {
        scrollPinReady.value = false
        document.documentElement.classList.remove('app-scroll-pinned')
      }

      try {
        const target = pinScrollSync()
        syncScrollY(target)

        await new Promise<void>((resolve) => {
          let attempts = 0

          const verify = () => {
            const top = pinScrollSync()
            syncScrollY(top)

            if (Math.abs(window.scrollY - target) < 1 || attempts >= MAX_PIN_FRAMES) {
              resolve()
              return
            }

            attempts++
            requestAnimationFrame(verify)
          }

          requestAnimationFrame(verify)
        })
      }
      finally {
        pinScrollSync()
        scrollPinReady.value = true
        pinPromise = null
      }
    })()

    return pinPromise
  }

  return {
    scrollPinReady,
    getMinScrollTop,
    pinScrollSync,
    ensureScrollPinned,
    syncReadyFromDom,
    scrollY,
  }
}
