<script setup lang="ts">
definePageMeta({
  viewTransition: fadeViewTransition,
})

const route = useRoute()
const agendaStore = useAgendaStore()
const { complete } = useQrScanCheckIn(() => sessionId.value)

const sessionId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' && id.length > 0 ? id : undefined
})

const code = ref('')
const error = ref('')

watchEffect(() => {
  if (!sessionId.value) return
  const exists = agendaStore.items.some(i => i.id === sessionId.value)
  if (!exists) navigateTo('/')
})

const scanBackFallback = computed(() =>
  sessionId.value ? `/scan/${sessionId.value}` : '/scan',
)
const { goBack } = useAppBack(scanBackFallback)

function submit() {
  error.value = ''
  if (!complete(code.value))
    error.value = 'Invalid code. Try again.'
}
</script>

<template>
  <div
    id="scan-code-page"
    class="page-content h-dvh bg-black grid grid-rows-[auto_minmax(0,1fr)]"
  >
    <AppTopBar class="px-4 py-2.5 h-auto flex items-center">
      <GlassPanel
        as="button"
        type="button"
        :deg="-45"
        class="appearance-none outline-none! size-11 shrink-0 rounded-4xl p-0 grid place-content-center active:scale-110 select-none"
        style="background: rgba(255, 255, 255, 0.2)"
        @click="goBack"
      >
        <Icon
          name="amplif:arrow-left"
          :size="24"
        />
      </GlassPanel>
    </AppTopBar>

    <main class="flex flex-col gap-6 px-4 pt-8">
      <div class="flex flex-col gap-2 text-center">
        <h1 class="text-[32px] font-bold leading-9 text-primary">
          Enter check-in code
        </h1>
        <p class="text-base leading-5 text-secondary">
          Type the room code from signage.
        </p>
      </div>

      <input
        v-model="code"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        placeholder="e.g. AMPQR-628EGNAJHN"
        class="w-full px-4 py-3.5 rounded-[20px] bg-[#1C1C1D] text-primary font-bold text-base outline-none border border-primary/10 focus:border-primary/30"
        @keyup.enter="submit"
      >

      <p
        v-if="error"
        class="text-caption text-center text-[#FF3B30] font-bold"
      >
        {{ error }}
      </p>

      <button
        type="button"
        class="appearance-none outline-none! w-full py-3.5 rounded-[20px] font-bold leading-6 text-center text-white active:scale-[1.015] transition-all select-none"
        style="background: linear-gradient(135deg, #ff6e00 0%, #ff003b 100%)"
        @click="submit"
      >
        Check in
      </button>
    </main>
  </div>
</template>
