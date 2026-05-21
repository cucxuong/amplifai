<script setup lang="ts">
const { unavailable } = useMinisiteStatus()
</script>

<template>
  <div
    v-if="unavailable"
    class="mx-4 mb-3 rounded-xl border border-[#FF6E00]/40 bg-[#FFF3EC] px-4 py-3 text-caption font-bold leading-snug text-[#0B0F17]"
    role="status"
  >
    Could not connect to event backend — sign out and try again.
  </div>
</template>
