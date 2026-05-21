<script setup lang="ts">
const { activeTab, APP_NAV_ITEMS } = useHomeNav()
const { navigateForward } = useNavigationIntent()

onMounted(() => {
  for (const route of ['/gift', '/scan', '/me'] as const)
    void preloadRouteComponents(route)
})

function selectNav(name: AppNav) {
  switch (name) {
    case AppNav.AGENDA:
      navigateForward('/agenda')
      break
    case AppNav.ME:
      navigateForward('/me')
      break
    case AppNav.SCAN:
      navigateForward('/scan')
      break
    case AppNav.GIFT:
      navigateForward('/gift')
      break
  }
}
</script>

<template>
  <GlassPanel
    class="h-15.5 p-1 rounded-full grid grid-cols-4 grid-rows-1"
    :style="{ background: 'linear-gradient(0deg, rgba(5, 10, 48, 0.4), rgba(5, 10, 48, 0.4)), rgba(255, 255, 255, 0.2)' }"
  >
    <button
      v-for="item in APP_NAV_ITEMS"
      :key="item.name"
      type="button"
      class="appearance-none outline-none! flex flex-col items-center justify-center gap-1 rounded-full p-2 pb-1.5 capitalize text-caption leading-[14px] font-bold"
      :class="activeTab === item.name ? 'glass-panel' : 'text-primary/50'"
      :style="activeTab === item.name ? { background: 'linear-gradient(0deg, rgba(5, 10, 48, 0.90) 0%, rgba(5, 10, 48, 0.90) 100%), rgba(255, 255, 255, 0.50)' } : ''"
      @click="selectNav(item.name)"
    >
      <Icon
        :name="item.icon"
        :size="24"
      />
      <span>{{ item.label }}</span>
    </button>
  </GlassPanel>
</template>
