<script setup lang="ts">
import { PERSONAS } from '~~/shared/utils/personas'

const { user, session } = useUserSession()

const personaImg = computed(() => {
  const persona = PERSONAS.find(p => p.id === session.value?.personaId)
  return persona?.image
})
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex flex-col">
      <h2 class="text-title capitalize">
        Hi, {{ user.name }}
      </h2>
      <div class="text-caption leading-[18px] text-secondary uppercase">
        {{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).replace(/,/g, ' · ') }}
      </div>
    </div>
    <div class="rounded-full aspect-square size-12.5 overflow-hidden bg-[#000D42]/10 outline-6 outline-primary/10 grid place-content-center">
      <NuxtImg
        v-if="personaImg"
        :src="personaImg"
        class="rounded-full size-full object-cover object-center"
      />
      <Icon
        v-else
        name="amplif:profile"
        :size="24"
      />
    </div>
  </div>
</template>
