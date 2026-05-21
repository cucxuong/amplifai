<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const root = ref<HTMLElement>()
const { setDockHeight, clearDockHeight } = useAppBottomDock()

const FALLBACK_DOCK_HEIGHT = 88

function measureDock() {
  if (!root.value)
    return
  setDockHeight(root.value.getBoundingClientRect().height)
}

useResizeObserver(root, measureDock)

onBeforeMount(() => {
  setDockHeight(FALLBACK_DOCK_HEIGHT)
})

onMounted(async () => {
  await nextTick()
  measureDock()
})

watch(() => root.value, measureDock)

onUnmounted(() => {
  clearDockHeight()
})
</script>

<template>
  <div
    ref="root"
    class="app-fixed-bottom"
    :class="$attrs.class"
  >
    <slot />
  </div>
</template>
