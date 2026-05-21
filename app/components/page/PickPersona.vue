<script setup lang="ts">
import { PERSONAS } from '#shared/utils/personas'

const { session } = useUserSession()

const selectedId = ref<string>(session.value?.personaId ?? 'default')
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
    class="h-full min-h-0 grid grid-rows-[minmax(0,1fr)]"
  >
    <main class="grid grid-rows-[auto_minmax(0,1fr)] gap-8 px-4 pt-8 py-5 overflow-y-auto overflow-x-clip">
      <div class="space-y-2">
        <h2 class="text-heading">
          Pick your persona
        </h2>
        <p class="text-secondary">
          You can change it anytime.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3 content-start">
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
      <AppBottomSpacer />
    </main>

    <AppFixedBottom class="px-4">
      <AppBottomBar class="space-y-3">
        <button
          type="button"
          class="flex justify-center w-full outline-none! px-5 py-3.5 rounded-[20px] font-bold leading-6 text-white active:scale-[1.015] transition-all disabled:opacity-60"
          style="background: linear-gradient(157.57deg, #FF6E00 0%, #FF003B 100%)"
          :disabled="!selectedId || isSubmitting"
          @click="confirmPersona"
        >
          Continue
        </button>
        <button
          type="button"
          class="flex justify-center w-full outline-none! text-caption text-subtle active:scale-[1.015] transition-all disabled:opacity-60"
          :disabled="isSubmitting"
          @click="skip"
        >
          Skip
        </button>
      </AppBottomBar>
    </AppFixedBottom>
  </div>
</template>
