<script setup lang="ts">
const props = defineProps<{
  label: string
  disabled?: boolean
  loading?: boolean
}>()

const isInactive = computed(() => props.disabled || props.loading)
</script>

<template>
  <button
    type="submit"
    class="flex justify-center w-full outline-none! px-5 py-3.5 rounded-[20px] font-bold leading-6 active:scale-[1.015] select-none transition-all text-white disabled:bg-subtle disabled:text-muted"
    :style="isInactive ? undefined : { background: 'linear-gradient(157.57deg, #FF6E00 0%, #FF003B 100%)' }"
    :disabled="isInactive"
  >
    {{ loading ? 'Please wait…' : label }}
  </button>
</template>
