<script setup lang="ts">
import { PERSONAS } from '#shared/utils/personas'

const { session, loggedIn } = useUserSession()
const { completeOnboarding } = useMinisiteAuth()

const backFallback = '/agenda'

const selectedId = ref<string>(session.value?.personaId ?? PERSONAS[0]!.id)
const isSubmitting = ref(false)
const formError = ref<string | null>(null)
const showSkip = computed(() => !session.value?.onboardingComplete)

async function confirmPersona() {
  if (!selectedId.value || isSubmitting.value)
    return
  isSubmitting.value = true
  formError.value = null
  try {
    await completeOnboarding({ personaId: selectedId.value })
    await navigateTo('/agenda', { replace: true })
  }
  catch (e: unknown) {
    formError.value = isUnauthorizedError(e)
      ? 'Could not connect to event backend — sign out and try again.'
      : (e instanceof Error ? e.message : 'Something went wrong.')
  }
  finally {
    isSubmitting.value = false
  }
}

async function skip() {
  if (isSubmitting.value)
    return
  isSubmitting.value = true
  formError.value = null
  try {
    await completeOnboarding({ skip: true })
    await navigateTo('/agenda', { replace: true })
  }
  catch (e: unknown) {
    formError.value = e instanceof Error ? e.message : 'Something went wrong.'
  }
  finally {
    isSubmitting.value = false
  }
}

function selectPersona(id: string) {
  selectedId.value = id
}
</script>

<template>
  <div
    id="pick-persona-page"
    class="h-dvh min-h-0 grid grid-rows-[auto_minmax(0,1fr)]"
  >
    <AppTopBar
      v-if="loggedIn"
      class="px-4 py-2.5 h-auto"
    >
      <UiBackButton :fallback="backFallback" />
    </AppTopBar>
    <main class="flex flex-col gap-8 px-4 pt-8 py-5 overflow-y-auto overflow-x-clip">
      <AppMinisiteUnavailableBanner />
      <p
        v-if="formError"
        class="text-caption text-[#FF003B]"
        role="alert"
      >
        {{ formError }}
      </p>
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
              :alt="persona.label"
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
        <UiCTAButton
          :disabled="!selectedId || isSubmitting"
          @click="confirmPersona"
        >
          Continue
        </UiCTAButton>
        <button
          v-if="showSkip"
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
