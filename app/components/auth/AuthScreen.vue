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
    class="page-content h-dvh min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <AppTopBar class="px-4 py-2.5 h-auto">
      <UiBackButton :fallback="backFallback" />
    </AppTopBar>
    <main class="flex flex-col gap-8 px-4 py-5 overflow-y-auto overflow-x-clip overscroll-contain">
      <slot />
    </main>
    
    <AppBottomBar class="px-4 pt-4 pb-10">
      <div class="text-center text-caption text-pretty text-subtle max-w-[350px] mx-auto">
        <strong>Privacy & data:</strong>
        <span> Authentication via Azure AD.</span>
        <span> Session-only.</span>
        <span> Data deleted 30 days post-event.</span>
      </div>
    </AppBottomBar>
  </div>
</template>
