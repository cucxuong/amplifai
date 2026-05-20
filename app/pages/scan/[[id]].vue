<script setup lang="ts">
const route = useRoute()
const store = useAgendaStore()

const sessionId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && id.length > 0 ? id : undefined
})

watchEffect(() => {
  if (!sessionId.value) return
  const exists = store.items.some(i => i.id === sessionId.value)
  if (!exists) navigateTo('/')
})
</script>

<template>
  <PageScanQr :session-id="sessionId" />
</template>
