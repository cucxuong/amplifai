<script setup lang="ts">
defineProps<{
  label: string
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <button
    type="submit"
    class="flex justify-center w-full outline-none! px-5 py-3.5 rounded-[20px] font-bold leading-6 active:scale-[1.015] select-none transition-all not-disabled:bg-[linear-gradient(135deg,#FF6E00,#FF003B)] disabled:bg-subtle disabled:text-muted"
    :disabled="disabled || loading"
  >
    {{ loading ? 'Please wait…' : label }}
  </button>
</template>
