<script setup lang="ts">
const { user } = useUserSession()
</script>

<template>
  <PageHomeContainer  class="gap-8">
    <div class="flex flex-col items-center justify-center text-center gap-6">
      <div class="size-24 rounded-full overflow-hidden bg-[#000D42]/10 border-6 border-primary/10 grid place-content-center">avatar</div>
      <div class="flex flex-col">
        <h2 class="text-title capitalize">
          {{ user.name }}
        </h2>
        <div class="text-caption leading-[18px] text-tertiary">
          {{ user.email }}
        </div>
      </div>
    </div>

    <PageHomeWidgets />
  </PageHomeContainer>
</template>
