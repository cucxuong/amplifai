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
  <GlassPanel
    as="button"
    type="button"
    :deg="-45"
    class="appearance-none outline-none! size-11 shrink-0 rounded-4xl p-0 bg-primary/5 grid place-content-center active:scale-110 select-none"
    @click="goBack"
  >
    <Icon
      name="amplif:arrow-left"
      :size="24"
    />
  </GlassPanel>
</template>
