<script setup lang="ts">
const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    email?: string
    variant?: 'otp' | 'confirm'
    error?: boolean
    errorMessage?: string
    disabled?: boolean
  }>(),
  {
    email: '',
    variant: 'otp',
    error: false,
    errorMessage: 'Invalid code. Try again',
    disabled: false,
  },
)

const emit = defineEmits<{
  complete: []
}>()

const OTP_LENGTH = 6
const hiddenInput = useTemplateRef<HTMLInputElement>('hiddenInput')
const digits = computed(() => {
  const chars = model.value.split('').slice(0, OTP_LENGTH)
  return Array.from({ length: OTP_LENGTH }, (_, i) => chars[i] ?? '')
})

const title = computed(() =>
  props.variant === 'confirm' ? 'Confirm email' : 'OTP Verification',
)

function focusInput() {
  hiddenInput.value?.focus()
}

function onInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, OTP_LENGTH)
  model.value = raw
  if (raw.length === OTP_LENGTH)
    emit('complete')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Backspace' && !model.value)
    event.preventDefault()
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH) ?? ''
  if (!pasted)
    return
  model.value = pasted
  if (pasted.length === OTP_LENGTH)
    emit('complete')
}
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h2 class="text-heading">
        {{ title }}
      </h2>
      <p
        v-if="variant === 'otp' && email"
        class="text-secondary"
      >
        Please enter the code we just sent to email
        <span class="font-bold">{{ email }}</span>
      </p>
      <p
        v-else
        class="text-secondary"
      >
        Enter the 6-digit code sent to your email
      </p>
    </div>

    <div
      class="glass-panel rounded-[20px] bg-white/20 px-6 pt-10 pb-8 space-y-8"
      @click="focusInput"
    >
      <div class="flex gap-2 justify-center">
        <div
          v-for="(digit, index) in digits"
          :key="index"
          class="flex-1 min-w-0 rounded-xl py-4 px-2 flex items-center justify-center bg-white/30"
          :class="error ? 'ring-1 ring-[#FF003B]' : ''"
        >
          <span
            class="text-2xl font-bold leading-8 text-primary w-8 text-center"
            :class="digit ? '' : 'text-tertiary'"
          >
            {{ digit || '–' }}
          </span>
        </div>
      </div>

      <input
        ref="hiddenInput"
        :value="model"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        class="sr-only"
        :disabled="disabled"
        @input="onInput"
        @keydown="onKeydown"
        @paste="onPaste"
      >

      <div
        v-if="error && errorMessage"
        class="flex gap-2 items-start justify-center"
        role="alert"
      >
        <Icon
          name="amplif:alert-circle"
          :size="16"
          class="shrink-0 text-[#FF003B] mt-0.5"
        />
        <p class="text-caption font-bold text-[#FF003B] leading-4">
          {{ errorMessage }}
        </p>
      </div>

      <slot />
    </div>
  </div>
</template>
