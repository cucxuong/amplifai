<script setup lang="ts">
defineProps<{
  label: string
  disabled?: boolean
  loading?: boolean
}>()
</script>

<template>
  <UiCTAButton
    type="submit"
    :disabled="disabled"
    :loading="loading"
  >
    {{ loading ? 'Please wait…' : label }}
  </UiCTAButton>
</template>
