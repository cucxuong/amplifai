<script setup lang="ts">
import { authErrorMessage } from '~/utils/auth-errors'

const RESEND_SECONDS = 20

const route = useRoute()
const email = computed(() => String(route.query.email ?? '').trim())
const isDev = import.meta.dev

const code = ref('')
const resetToken = ref('')
const otpVerified = ref(false)
const password = ref('')
const confirmPassword = ref('')
const isVerifyingOtp = ref(false)
const isSubmitting = ref(false)
const isResending = ref(false)
const otpError = ref(false)
const formError = ref<string | null>(null)
const passwordMismatch = ref(false)
const resendCountdown = ref(0)

let resendTimer: ReturnType<typeof setInterval> | null = null

const canVerifyOtp = computed(
  () => email.value && code.value.trim().length === 6 && !isVerifyingOtp.value,
)

const canResetPassword = computed(
  () =>
    otpVerified.value
    && password.value.length >= 6
    && password.value === confirmPassword.value
    && !isSubmitting.value,
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

watch([password, confirmPassword], () => {
  passwordMismatch.value = Boolean(
    confirmPassword.value && password.value !== confirmPassword.value,
  )
})

watch(code, () => {
  if (otpVerified.value) {
    otpVerified.value = false
    resetToken.value = ''
  }
})

onMounted(() => {
  if (!email.value)
    navigateTo('/sign-in/forgot-password')
  else
    startResendCountdown()
})

onUnmounted(() => {
  if (resendTimer)
    clearInterval(resendTimer)
})

async function verifyOtp() {
  if (!canVerifyOtp.value || isVerifyingOtp.value)
    return

  otpError.value = false
  formError.value = null
  isVerifyingOtp.value = true
  try {
    const result = await $fetch<{ ok: boolean, resetToken: string }>(
      '/api/auth/verify-otp',
      {
        method: 'POST',
        body: {
          email: email.value,
          code: code.value.trim(),
          purpose: 'reset',
        },
      },
    )
    resetToken.value = result.resetToken
    otpVerified.value = true
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
    isVerifyingOtp.value = false
  }
}

async function resendCode() {
  if (resendCountdown.value > 0 || isResending.value || otpVerified.value)
    return

  formError.value = null
  otpError.value = false
  isResending.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    startResendCountdown()
  }
  catch (err: unknown) {
    formError.value = authErrorMessage(err, 'Could not resend code. Try again.')
  }
  finally {
    isResending.value = false
  }
}

async function submitReset() {
  formError.value = null
  passwordMismatch.value = false

  if (password.value !== confirmPassword.value) {
    passwordMismatch.value = true
    return
  }

  isSubmitting.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        resetToken: resetToken.value,
      },
      credentials: 'include',
    })

    const ok = await refreshAuthSession()
    if (!ok) {
      formError.value = 'Session could not be started. Try again.'
      return
    }

    await navigateTo('/')
  }
  catch (err: unknown) {
    formError.value = authErrorMessage(err, 'Reset failed. Try again.')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthScreen back-fallback="/sign-in/forgot-password">
    <template v-if="!otpVerified">
      <div class="space-y-2">
        <h2 class="text-heading">
          Verify code
        </h2>
        <p class="text-secondary">
          Enter the 6-digit code sent to {{ email }}
        </p>
      </div>

      <form @submit.prevent="verifyOtp">
        <p
          v-if="formError"
          class="text-caption text-[#FF003B] mb-4"
          role="alert"
        >
          {{ formError }}
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
          :disabled="isVerifyingOtp || isSubmitting"
          :resend-countdown="resendCountdown"
          @complete="verifyOtp"
        >
          <div class="space-y-3 w-full">
            <AuthPrimaryButton
              label="Verify"
              :disabled="!canVerifyOtp"
              :loading="isVerifyingOtp"
            />
            <p
              v-if="resendCountdown === 0"
              class="text-center text-sm text-secondary"
            >
              Don't receive OTP?
              <button
                type="button"
                class="font-bold text-tertiary px-2 py-1 disabled:opacity-50"
                :disabled="isResending"
                @click="resendCode"
              >
                {{ isResending ? 'Sending…' : 'Resend' }}
              </button>
            </p>
          </div>
        </AuthOtpInput>
      </form>
    </template>

    <template v-else>
      <div class="space-y-2">
        <h2 class="text-heading">
          Enter new password
        </h2>
        <p class="text-secondary">
          Choose a new password for your account
        </p>
      </div>

      <form
        class="space-y-0"
        @submit.prevent="submitReset"
      >
        <p
          v-if="formError"
          class="text-caption text-[#FF003B] mb-2"
          role="alert"
        >
          {{ formError }}
        </p>

        <AuthField
          v-model="password"
          label="New password"
          type="password"
          icon="amplif:lock"
          placeholder="Enter your password"
          autocomplete="new-password"
          :disabled="isSubmitting"
          :clearable="false"
        />

        <AuthField
          v-model="confirmPassword"
          label="Confirm password"
          type="password"
          icon="amplif:lock"
          placeholder="Confirm your password"
          autocomplete="new-password"
          :disabled="isSubmitting"
          :error="passwordMismatch"
          error-message="Passwords do not match"
          :clearable="false"
        />

        <div class="pt-8">
          <AuthPrimaryButton
            label="Reset password"
            :disabled="!canResetPassword"
            :loading="isSubmitting"
          />
        </div>
      </form>
    </template>
  </AuthScreen>
</template>
