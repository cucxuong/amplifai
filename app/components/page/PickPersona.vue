<script setup lang="ts">
import { PERSONAS } from '#shared/utils/personas'

const selectedId = ref<string>('default')
const isSubmitting = ref(false)

async function completeOnboarding(body: { personaId?: string, skip?: boolean }) {
  if (isSubmitting.value)
    return
  isSubmitting.value = true
  try {
    await $fetch('/api/user/persona', { method: 'POST', body })
    const ok = await refreshAuthSession()
    if (!ok)
      return
    await navigateTo('/agenda', { replace: true })
  }
  finally {
    isSubmitting.value = false
  }
}

function selectPersona(id: string) {
  selectedId.value = id
}

async function confirmPersona() {
  if (!selectedId.value)
    return
  await completeOnboarding({ personaId: selectedId.value })
}

async function skip() {
  await completeOnboarding({ skip: true })
}
</script>

<template>
  <div
    id="pick-persona-page"
    class="h-dvh grid grid-rows-[minmax(0,1fr)_auto]"
  >
    <main class="grid grid-rows-[auto_minmax(0,1fr)] gap-8 p-4 pt-8">
      <div class="space-y-2">
        <h2 class="text-heading">
          Pick your persona
        </h2>
        <p class="text-secondary">
          You can change it anytime.
        </p>
      </div>

      <div class="flex flex-col overflow-y-auto overflow-x-clip p-4 -m-4">
        <div class="grid grid-cols-2 gap-3">
          <GlassPanel
            v-for="persona in PERSONAS"
            :key="persona.id"
            as="button"
            type="button"
            class="appearance-none outline-1 -outline-offset-1 transition-all active:scale-[1.015] disabled:opacity-60 disabled:pointer-events-none p-4 pr-3.5 gap-3 flex flex-col items-center justify-center text-center"
            :class="selectedId === persona.id ? 'outline-[#FF6E00] bg-primary/20' : 'outline-transparent! bg-primary/5'"
            :deg="-30"
            :disabled="isSubmitting"
            @click="selectPersona(persona.id)"
          >
            <div class="rounded-full size-22.5 overflow-hidden bg-[#000D42]/10 outline-6 outline-primary/10">
              <NuxtImg
                :src="persona.image"
                class="rounded-full size-full object-cover object-center"
              />
            </div>
            <span class="font-bold text-[14px] leading-[18px] text-primary">{{ persona.label }}</span>
          </GlassPanel>
        </div>
      </div>
    </main>

    <AppBottomBar class="space-y-3 pb-4">
      <button
        class="flex justify-center w-full outline-none! p-5 py-3.5 rounded-[20px] font-bold leading-[24px] active:scale-[1.015] transition-all"
        style="background: linear-gradient(135deg, #FF6E00 0%, #FF003B 100%);"
        :disabled="!selectedId || isSubmitting"
        @click="confirmPersona"
      >
        Continue
      </button>
      <button
        class="flex justify-center w-full outline-none! text-caption active:scale-[1.015] transition-all"
        :disabled="isSubmitting"
        @click="skip"
      >
        Skip
      </button>
    </AppBottomBar>
  </div>
</template>
