<script setup lang="ts">
const APP_MIN_SCROLL_TOP_VAR = '--app-min-scroll-top'

usePageBodyBackground()

const minScrollTopRaw = useCssVar(APP_MIN_SCROLL_TOP_VAR)

const minScrollTop = computed(
  () => Number.parseFloat(minScrollTopRaw.value ?? '62') || 62,
)

const { y: scrollY } = useWindowScroll({ behavior: 'instant' })

useBlockUserWindowScroll()
usePortraitOrientationLock()

/** Programmatic peek offset only; user scroll blocked on html/body. */
watch(() => scrollY.value !== minScrollTop.value, (y) => {
  if (y)
    scrollY.value = minScrollTop.value
}, { immediate: true })
</script>

<template>
  <div class="pt-(--app-min-scroll-top) pb-25 w-dvw max-w-md mx-auto">
    <NuxtPage />
  </div>
</template>
