<script setup lang="ts">
/** Matches initial “peek” offset; user cannot scroll above this. */
const MIN_SCROLL_TOP = 60

function clampScrollTop() {
  if (window.scrollY !== MIN_SCROLL_TOP)
    window.scrollTo({ top: MIN_SCROLL_TOP, left: 0, behavior: 'instant' })
}

onMounted(() => {
  window.scrollTo({ top: MIN_SCROLL_TOP, left: 0, behavior: 'instant' })
  useEventListener(window, 'scroll', clampScrollTop, { passive: true })
})

const appStyles = ref({})

provide('appStyles', appStyles)
</script>

<template>
  <div
    class="pt-15 pb-25 w-dvw max-w-md mx-auto"
    :style="{ '--app-min-scroll-top': `${MIN_SCROLL_TOP}px`, ...appStyles}"
  >
    <NuxtPage />
  </div>
</template>
