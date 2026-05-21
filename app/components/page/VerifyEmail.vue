<script setup lang="ts">
import { authErrorMessage } from '~/utils/auth-errors'

const RESEND_SECONDS = 20

const route = useRoute()
const email = computed(() => String(route.query.email ?? '').trim())

const code = ref('')
const isSubmitting = ref(false)
const isResending = ref(false)
const otpError = ref(false)
const formError = ref<string | null>(null)
const resendMessage = ref<string | null>(null)
const resendCountdown = ref(0)

const isDev = import.meta.dev
let resendTimer: ReturnType<typeof setInterval> | null = null

const canSubmit = computed(
  () => email.value && code.value.trim().length === 6 && !isSubmitting.value,
)

function startResendCountdown() {
  resendCountdown.value = RESEND_SECONDS
  if (resendTimer)
    clearInterval(resendTimer)
  resendTimer = setInterval(() => {
    if (resendCountdown.value > 0)
      resendCountdown.value -= 1
    else if (resendTimer)
      clearInterval(resendTimer)
  }, 1000)
}

onMounted(() => {
  if (!email.value)
    navigateTo('/sign-up')
  else
    startResendCountdown()
})

onUnmounted(() => {
  if (resendTimer)
    clearInterval(resendTimer)
})

async function verifyEmail() {
  if (!canSubmit.value || isSubmitting.value)
    return

  otpError.value = false
  formError.value = null
  resendMessage.value = null
  isSubmitting.value = true
  try {
    const result = await $fetch<{ ok: boolean, redirectToSignIn?: boolean }>('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        email: email.value,
        code: code.value.trim(),
        purpose: 'signup',
      },
      credentials: 'include',
    })

    if (result.redirectToSignIn) {
      await navigateTo({ path: '/sign-in', query: { verified: '1', email: email.value } })
      return
    }

    formError.value = 'Verification succeeded but redirect failed. Sign in manually.'
  }
  catch (err: unknown) {
    const message = authErrorMessage(err, 'Verification failed. Try again.')
    if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('expired')) {
      otpError.value = true
    }
    else {
      formError.value = message
    }
  }
  finally {
    isSubmitting.value = false
  }
}

async function resendCode() {
  if (resendCountdown.value > 0 || isResending.value)
    return

  formError.value = null
  otpError.value = false
  resendMessage.value = null
  isResending.value = true
  try {
    await $fetch('/api/auth/resend-otp', {
      method: 'POST',
      body: { email: email.value, purpose: 'signup' },
    })
    resendMessage.value = isDev
      ? 'New code sent — check the dev server terminal.'
      : 'A new code has been sent to your email.'
    startResendCountdown()
  }
  catch (err: unknown) {
    formError.value = authErrorMessage(err, 'Could not resend code. Try again.')
  }
  finally {
    isResending.value = false
  }
}
</script>

<template>
  <AuthScreen
    page-id="sign-up-verify-page"
    back-fallback="/sign-up"
  >
    <div class="space-y-2">
      <h2 class="text-heading">
        Confirm email
      </h2>
      <p class="text-secondary">
        Enter the 6-digit code sent to your email
      </p>
    </div>

    <form @submit.prevent="verifyEmail">
      <p
        v-if="formError"
        class="text-caption text-[#FF003B] mb-4"
        role="alert"
      >
        {{ formError }}
      </p>
      <p
        v-if="resendMessage"
        class="text-caption text-secondary mb-4"
      >
        {{ resendMessage }}
      </p>
      <p
        v-if="isDev"
        class="text-caption text-subtle mb-4"
      >
        Demo: use OTP code <code class="text-tertiary">111111</code>.
      </p>

      <AuthOtpInput
        v-model="code"
        :error="otpError"
        error-message="Invalid code. Try again"
        :disabled="isSubmitting"
        :resend-countdown="resendCountdown"
        @complete="verifyEmail"
      >
        <div class="space-y-3 w-full">
          <AuthPrimaryButton
            label="Verify"
            :disabled="!canSubmit"
            :loading="isSubmitting"
          />
          <p
            v-if="resendCountdown === 0"
            class="text-center text-sm text-secondary"
          >
            Don't receive OTP?
            <button
              type="button"
              class="font-bold text-tertiary px-2 py-1 disabled:opacity-50"
              :disabled="isResending || !email"
              @click="resendCode"
            >
              {{ isResending ? 'Sending…' : 'Resend' }}
            </button>
          </p>
        </div>
      </AuthOtpInput>
    </form>
  </AuthScreen>
</template>
