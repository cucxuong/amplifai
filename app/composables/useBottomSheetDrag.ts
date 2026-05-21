export function useBottomSheetDrag(onDismiss: () => void) {
  const dragOffset = ref(0)
  const isDragging = ref(false)

  let startY = 0
  const dismissThreshold = 96

  const sheetDragStyle = computed(() => {
    if (dragOffset.value <= 0)
      return undefined

    return {
      transform: `translateY(calc(var(--app-scroll-bottom) + ${dragOffset.value}px))`,
      transition: 'none',
    }
  })

  function onDragStart(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0)
      return

    isDragging.value = true
    startY = event.clientY
    dragOffset.value = 0
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }

  function onDragMove(event: PointerEvent) {
    if (!isDragging.value)
      return

    dragOffset.value = Math.max(0, event.clientY - startY)
  }

  function onDragEnd(event: PointerEvent) {
    if (!isDragging.value)
      return

    isDragging.value = false

    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
    }
    catch {}

    if (dragOffset.value >= dismissThreshold) {
      dragOffset.value = 0
      onDismiss()
      return
    }

    dragOffset.value = 0
  }

  function resetDrag() {
    dragOffset.value = 0
    isDragging.value = false
  }

  return {
    isDragging,
    sheetDragStyle,
    onDragStart,
    onDragMove,
    onDragEnd,
    resetDrag,
  }
}
