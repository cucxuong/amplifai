<script setup lang="ts">
import { authErrorMessage } from '~/utils/auth-errors'

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
const otpError = ref(false)
const formError = ref<string | null>(null)
const passwordMismatch = ref(false)

const canVerifyOtp = computed(
  () => email.value && code.value.trim().length === 6 && !isVerifyingOtp.value,
)

const canResetPassword = computed(
  () =>
    otpVerified.value
    && password.value.length >= 8
    && password.value === confirmPassword.value
    && !isSubmitting.value,
)

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
    <form
      class="space-y-6"
      @submit.prevent="otpVerified ? submitReset() : verifyOtp()"
    >
      <p
        v-if="formError"
        class="text-caption text-[#FF003B]"
        role="alert"
      >
        {{ formError }}
      </p>
      <p
        v-if="isDev"
        class="text-caption text-subtle"
      >
        Dev: code is printed in the terminal as
        <code class="text-tertiary">[smtp.service] sendOtpEmail</code>.
      </p>

      <AuthOtpInput
        v-model="code"
        variant="otp"
        :email="email"
        :error="otpError"
        error-message="Invalid code. Try again"
        :disabled="isVerifyingOtp || isSubmitting || otpVerified"
      >
        <AuthPrimaryButton
          v-if="!otpVerified"
          label="Verify"
          :disabled="!canVerifyOtp"
          :loading="isVerifyingOtp"
        />
      </AuthOtpInput>

      <div
        v-if="otpVerified"
        class="space-y-2"
      >
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

        <div class="pt-4">
          <AuthPrimaryButton
            label="Reset password"
            :disabled="!canResetPassword"
            :loading="isSubmitting"
          />
        </div>
      </div>
    </form>
  </AuthScreen>
</template>
