<script setup lang="ts">
definePageMeta({
  viewTransition: {
    enabled: true,
    types: ['fade'],
    toTypes: ['slide-in'],
    fromTypes: ['slide-out'],
  },
})
</script>

<template>
  <PageSignIn />
</template>
