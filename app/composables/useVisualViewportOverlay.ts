import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

/** Pin fixed overlays to the visible viewport (above mobile keyboard). */
export function useVisualViewportOverlay(active: MaybeRefOrGetter<boolean>) {
  const overlayStyle = ref<Record<string, string>>({})

  function sync() {
    const vv = window.visualViewport
    if (!vv) {
      overlayStyle.value = {}
      return
    }

    overlayStyle.value = {
      top: `${vv.offsetTop}px`,
      height: `${vv.height}px`,
    }
  }

  function attach() {
    sync()
    window.visualViewport?.addEventListener('resize', sync)
    window.visualViewport?.addEventListener('scroll', sync)
  }

  function detach() {
    window.visualViewport?.removeEventListener('resize', sync)
    window.visualViewport?.removeEventListener('scroll', sync)
    overlayStyle.value = {}
  }

  watch(
    () => toValue(active),
    (isActive) => {
      if (!import.meta.client)
        return

      if (isActive)
        attach()
      else
        detach()
    },
    { immediate: true },
  )

  onUnmounted(detach)

  const hasViewportBounds = computed(() => 'height' in overlayStyle.value)

  const style = computed(() => {
    if (!hasViewportBounds.value)
      return { top: '0px', bottom: '0px' }

    return overlayStyle.value
  })

  return { style, hasViewportBounds }
}
