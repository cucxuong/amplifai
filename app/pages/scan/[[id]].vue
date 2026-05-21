<script setup lang="ts">
import { prefetchQrScannerLibrary } from '~/composables/useQrScanner'

const route = useRoute()

const sessionId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && id.length > 0 ? id : undefined
})

const { item, ready } = useAgendaItemRoute(sessionId)

onMounted(() => {
  void prefetchQrScannerLibrary()
})

watchEffect(() => {
  if (!sessionId.value || !ready.value)
    return
  if (!item.value)
    navigateTo('/')
})
</script>

<template>
  <PageScanQr :session-id="sessionId" />
</template>
