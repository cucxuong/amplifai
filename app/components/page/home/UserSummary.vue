<script setup lang="ts">
import { PERSONAS } from '~~/shared/utils/personas'

const { user, session } = useUserSession()

const personaImg = computed(() => {
  const persona = PERSONAS.find(p => p.id === session.value?.personaId)
  return persona?.image
})

function openPickPersona() {
  navigateTo('/pick-persona')
}
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
    <button
      type="button"
      class="appearance-none bg-[#000D42]/10 grid place-content-center active:scale-110 transition-transform rounded-full size-12.5 outline-6 outline-primary/10"
      aria-label="Change persona"
      @click="openPickPersona"
    >
      <NuxtImg
        v-if="personaImg"
        :src="personaImg"
        class="rounded-full size-12.5 object-cover object-center"
      />
      <Icon
        v-else
        name="amplif:profile"
        :size="24"
      />
    </button>
  </div>
</template>
