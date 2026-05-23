<script setup lang="ts">
usePageBodyBackground()

const pageTransitionName = usePageTransitionName()
const { scrollPinReady, pinScrollSync, getMinScrollTop, scrollY } = useAppScrollPin()

const pageTransition = computed(() => ({
  name: pageTransitionName.value,
  mode: 'out-in' as const,
  onBeforeEnter() {
    pinScrollSync()
  },
}))

useBlockUserWindowScroll()
usePortraitOrientationLock()

/** Safari full-bleed: correct drift only after pin is verified (not during navigation). */
watch(
  () => scrollPinReady.value && Math.abs(scrollY.value - getMinScrollTop()) > 0.5,
  (drifted) => {
    if (drifted)
      scrollY.value = getMinScrollTop()
  },
)
</script>

<template>
  <div class="app-wrapper">
    <div
      class="page-route-host min-h-0 flex-1"
    >
      <NuxtLayout>
        <NuxtPage
          :transition="pageTransition"
          :page-key="(route) => route.path"
        />
      </NuxtLayout>
    </div>
  </div>
</template>
