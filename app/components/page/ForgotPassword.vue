<script setup lang="ts">
import { authErrorMessage } from '~/utils/auth-errors'

const email = ref('')
const isSubmitting = ref(false)
const fieldError = ref<string | null>(null)

const canSubmit = computed(() => email.value.trim() && !isSubmitting.value)

async function sendCode() {
  fieldError.value = null
  isSubmitting.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value.trim() },
    })
    await navigateTo({
      path: '/sign-in/verify-code',
      query: { email: email.value.trim() },
    })
  }
  catch (err: unknown) {
    fieldError.value = authErrorMessage(err, 'Could not send code. Try again.')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthScreen back-fallback="/sign-in">
    <div class="space-y-2">
      <h2 class="text-heading">
        Forgot password?
      </h2>
      <p class="text-secondary">
        Enter the email address associated with your account
      </p>
    </div>

    <form
      class="space-y-2"
      @submit.prevent="sendCode"
    >
      <p
        v-if="fieldError"
        class="text-caption text-[#FF003B]"
        role="alert"
      >
        {{ fieldError }}
      </p>

      <AuthField
        v-model="email"
        label="Email Address"
        type="email"
        icon="amplif:mail"
        placeholder="Enter your email"
        autocomplete="email"
        inputmode="email"
        :disabled="isSubmitting"
      />

      <div class="pt-4">
        <AuthPrimaryButton
          label="Send code"
          :disabled="!canSubmit"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </AuthScreen>
</template>
