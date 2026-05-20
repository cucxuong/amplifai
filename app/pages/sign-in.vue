<script setup lang="ts">
definePageMeta({
  viewTransition: {
    enabled: true,
    types: ['slide'],
    toTypes: ['slide-in'],
    fromTypes: ['slide-out'],
  },
})
</script>

<template>
  <PageSignIn />
</template>
