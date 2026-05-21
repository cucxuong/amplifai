<script setup lang="ts">
const APP_MIN_SCROLL_TOP_VAR = '--app-min-scroll-top'

usePageBodyBackground()

const pageTransitionName = usePageTransitionName()

const pageTransition = computed(() => ({
  name: pageTransitionName.value,
  mode: 'out-in' as const,
}))

const minScrollTopRaw = useCssVar(APP_MIN_SCROLL_TOP_VAR)

const minScrollTop = computed(
  () => Number.parseFloat(minScrollTopRaw.value ?? '62') || 62,
)

const { y: scrollY } = useWindowScroll({ behavior: 'instant' })

useBlockUserWindowScroll()
usePortraitOrientationLock()

/** Safari full-bleed: 62px programmatic scroll peek — do not replace with fixed bg layers. */
watch(() => scrollY.value !== minScrollTop.value, (off) => {
  if (off)
    scrollY.value = minScrollTop.value
}, { immediate: true })
</script>

<template>
  <div class="app-wrapper">
    <div class="page-route-host min-h-0 flex-1">
      <NuxtLayout>
        <NuxtPage
          :transition="pageTransition"
          :page-key="(route) => route.path"
        />
      </NuxtLayout>
    </div>
  </div>
</template>
