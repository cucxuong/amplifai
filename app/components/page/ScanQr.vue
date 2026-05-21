<script setup lang="ts">
const props = defineProps<{
  /** When set, QR must decode to this agenda id (session-scoped check-in). */
  sessionId?: string
}>()

const { validate, complete } = useQrScanCheckIn(() => props.sessionId)

const videoRef = ref<HTMLVideoElement | null>(null)
const isHandling = ref(false)
const scanUiStatus = ref<'searching' | 'invalid' | 'checking_in'>('searching')
const showManualCode = ref(false)
const manualCode = ref('')
const manualCodeError = ref(false)
const isSubmittingManualCode = ref(false)

const { status: scannerStatus, start, stop } = useQrScanner({
  videoRef,
  onDecode: handleDecode,
})

const statusLabel = computed(() => {
  if (scanUiStatus.value === 'checking_in') return 'CHECKING IN…'
  if (scanUiStatus.value === 'invalid') return 'INVALID QR'
  if (scannerStatus.value === 'permission_denied') return 'CAMERA ACCESS NEEDED'
  if (scannerStatus.value === 'error') return 'CAMERA UNAVAILABLE'
  return 'SEARCHING FOR QR…'
})

function resetInvalid() {
  scanUiStatus.value = 'searching'
}

function showInvalid() {
  scanUiStatus.value = 'invalid'
  window.setTimeout(resetInvalid, 2500)
}

async function submitValidatedCode(text: string, opts?: { manual?: boolean }) {
  const parsed = validate(text)
  if (!parsed.ok) {
    if (opts?.manual)
      manualCodeError.value = true
    else
      showInvalid()
    return false
  }

  stop()
  isHandling.value = true
  scanUiStatus.value = 'checking_in'

  const ok = await complete(text)
  if (!ok) {
    isHandling.value = false
    scanUiStatus.value = 'searching'
    if (opts?.manual)
      manualCodeError.value = true
    else
      start()
    return false
  }
  return true
}

function handleDecode(text: string) {
  if (isHandling.value)
    return
  void submitValidatedCode(text)
}

function useCodeInstead() {
  showManualCode.value = true
}

function closeManualCode() {
  showManualCode.value = false
  manualCode.value = ''
  manualCodeError.value = false
  if (!isHandling.value)
    start()
}

function submitManualCode() {
  if (!manualCode.value.trim() || isSubmittingManualCode.value)
    return

  manualCodeError.value = false
  isSubmittingManualCode.value = true

  void (async () => {
    const ok = await submitValidatedCode(manualCode.value, { manual: true })
    if (ok)
      showManualCode.value = false
    isSubmittingManualCode.value = false
  })()
}

watch(manualCode, () => {
  manualCodeError.value = false
})

watch(showManualCode, (open) => {
  if (open)
    stop()
})

watch(
  videoRef,
  (el) => {
    if (el) nextTick(() => start())
  },
  { flush: 'post' },
)

onUnmounted(() => stop())
</script>

<template>
  <div
    id="scan-qr-page"
    class="page-content fixed inset-0 z-20 bg-black grid grid-rows-[auto_minmax(0,1fr)]"
  >
    <AppTopBar class="px-4 py-2.5 h-auto flex items-center">
      <UiBackButton fallback="/agenda" />
    </AppTopBar>

    <main
      class="flex flex-col items-center justify-between px-4 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] min-h-0"
    >
      <div class="flex flex-col items-center gap-12 w-full shrink-0">
        <div class="flex flex-col gap-2 text-center w-full">
          <h1 class="text-[32px] font-bold leading-9 text-primary">
            Scan QR code
          </h1>
          <p class="text-base leading-5 text-secondary">
            Hold steady on the room QR.
          </p>
        </div>

        <ClientOnly>
          <div class="relative size-[302px] shrink-0">
            <video
              ref="videoRef"
              class="absolute inset-[4px] size-[calc(100%-8px)] object-cover bg-black rounded-2xl"
              playsinline
              muted
            />

            <div
              class="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <span
                class="absolute top-0 left-0 size-12 border-t-[3px] border-l-[3px] border-white rounded-tl-3xl"
              />
              <span
                class="absolute top-0 right-0 size-12 border-t-[3px] border-r-[3px] border-white rounded-tr-3xl"
              />
              <span
                class="absolute bottom-0 left-0 size-12 border-b-[3px] border-l-[3px] border-white rounded-bl-3xl"
              />
              <span
                class="absolute bottom-0 right-0 size-12 border-b-[3px] border-r-[3px] border-white rounded-br-3xl"
              />

              <div class="scan-qr-glow absolute left-[4px] right-[4px] h-16 bottom-8" />
              <div class="scan-qr-line absolute left-[4px] right-[4px] h-0.5 bg-[#FF3B30]" />
            </div>
          </div>
          <template #fallback>
            <div
              class="relative size-[302px] shrink-0 bg-black/50 grid place-content-center"
            >
              <span class="text-subtle text-caption">Loading camera…</span>
            </div>
          </template>
        </ClientOnly>

        <p
          class="text-caption uppercase tracking-widest text-subtle text-center"
        >
          {{ statusLabel }}
        </p>

        <button
          v-if="scannerStatus === 'permission_denied' || scannerStatus === 'error'"
          type="button"
          class="appearance-none outline-none! text-primary text-label font-bold underline"
          @click="start()"
        >
          Retry camera
        </button>
      </div>

      <button
        type="button"
        class="appearance-none outline-none! flex items-center justify-center gap-2 px-5 py-4 rounded-full bg-[#1C1C1D] text-primary font-bold text-base leading-6 active:opacity-80 transition-opacity shrink-0"
        @click="useCodeInstead"
      >
        <Icon
          name="amplif:keyboard"
          :size="24"
        />
        Use code instead
      </button>
    </main>

    <PageScanCodeManual
      v-model:open="showManualCode"
      v-model="manualCode"
      :error="manualCodeError"
      :submitting="isSubmittingManualCode"
      @close="closeManualCode"
      @submit="submitManualCode"
    />
  </div>
</template>

<style scoped>
.scan-qr-line {
  animation: scan-qr-sweep 2.4s ease-in-out infinite;
}

.scan-qr-glow {
  background: linear-gradient(
    180deg,
    rgba(255, 110, 0, 0.45) 0%,
    rgba(255, 60, 0, 0.12) 55%,
    transparent 100%
  );
  animation: scan-qr-sweep 2.4s ease-in-out infinite;
}

@keyframes scan-qr-sweep {
  0%,
  100% {
    top: 18%;
  }
  50% {
    top: 72%;
  }
}
</style>
