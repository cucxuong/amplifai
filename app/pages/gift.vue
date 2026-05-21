<script setup lang="ts">
import { setGiftPageEnterComplete } from '~/utils/gift-page-enter'

definePageMeta({
  layout: 'shell',
  pageTransition: {
    onBeforeEnter() {
      setGiftPageEnterComplete(false)
    },
    onAfterEnter() {
      setGiftPageEnterComplete(true)
    },
    onBeforeLeave() {
      setGiftPageEnterComplete(false)
    },
  },
})
</script>

<template>
  <PageGift />
</template>
