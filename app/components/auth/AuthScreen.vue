<script setup lang="ts">
withDefaults(
  defineProps<{
    pageId?: string
    backFallback?: string
  }>(),
  {
    pageId: 'sign-in-page',
    backFallback: '/',
  },
)
</script>

<template>
  <div
    :id="pageId"
    class="page-content h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <AppTopBar>
      <UiBackButton :fallback="backFallback" />
    </AppTopBar>
    <main class="space-y-8 p-4 py-5 overflow-y-auto overflow-x-clip">
      <slot />
    </main>
    <AppBottomBar>
      <div class="text-center text-caption text-pretty text-subtle *:inline-block">
        <strong>Privacy & data:</strong>
        <span> Session-only sign-in.</span>
        <span> Data deleted 30 days post-event.</span>
      </div>
    </AppBottomBar>
  </div>
</template>
