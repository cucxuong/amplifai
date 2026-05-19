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
</script>

<template>
  <div
    class="pt-15 pb-25 w-dvw max-w-md mx-auto"
    style="background: url('/sign-in.png') no-repeat; background-size: cover; background-position: 30% 0%;"
  >
    <NuxtPage />
  </div>
</template>
