<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    fallback?: string
  }>(),
  {
    fallback: '/agenda',
  },
)

const { goBack } = useAppBack(() => props.fallback)
</script>

<template>
  <button
    type="button"
    class="glass-panel appearance-none outline-none! size-11 shrink-0 rounded-full bg-white/20 p-2.5 shadow-[0_4px_8px_rgba(0,0,0,0.04)] grid place-content-center active:scale-110 select-none transition-transform"
    @click="goBack"
  >
    <Icon
      name="amplif:arrow-left"
      :size="24"
      class="text-primary"
    />
  </button>
</template>
