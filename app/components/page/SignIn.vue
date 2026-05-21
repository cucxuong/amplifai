<script setup lang="ts">
import { authErrorCode, authErrorMessage, authErrorStatus } from '~/utils/auth-errors'
import { DEMO_GUEST_EMAIL, DEMO_GUEST_PASSWORD } from '~/utils/demo-auth'

const route = useRoute()

const email = ref(DEMO_GUEST_EMAIL)
const password = ref(DEMO_GUEST_PASSWORD)
const isSubmitting = ref(false)
const passwordError = ref(false)
const formError = ref<string | null>(null)
const verifyEmailAddress = ref<string | null>(null)

const verifiedMessage = computed(() =>
  route.query.verified === '1'
    ? 'Email verified. Sign in with your account.'
    : null,
)

onMounted(() => {
  const queryEmail = String(route.query.email ?? '').trim()
  if (queryEmail)
    email.value = queryEmail
})

const canSubmit = computed(
  () => email.value.trim() && password.value.length >= 6 && !isSubmitting.value,
)

async function submitLogin() {
  passwordError.value = false
  formError.value = null
  verifyEmailAddress.value = null
  isSubmitting.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        password: password.value,
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
    if (authErrorStatus(err) === 403 || authErrorCode(err) === 'EMAIL_NOT_VERIFIED') {
      verifyEmailAddress.value = email.value.trim()
      formError.value = authErrorMessage(
        err,
        'Please verify your email before signing in.',
      )
      return
    }

    passwordError.value = true
    formError.value = authErrorMessage(err, 'Sign in failed. Try again.')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthScreen back-fallback="/">
    <div class="space-y-2">
      <h2 class="text-heading">
        Sign in
      </h2>
      <p class="text-secondary">
        Welcome back to AmplifAI.
      </p>
    </div>

    <form
      class="space-y-2"
      @submit.prevent="submitLogin"
    >
      <p
        v-if="verifiedMessage"
        class="text-caption text-secondary"
        role="status"
      >
        {{ verifiedMessage }}
      </p>

      <p
        v-if="formError && !passwordError"
        class="text-caption text-[#FF003B]"
        role="alert"
      >
        {{ formError }}
        <NuxtLink
          v-if="verifyEmailAddress"
          :to="{ path: '/sign-up/verify-email', query: { email: verifyEmailAddress } }"
          class="font-bold underline block mt-1"
        >
          Verify email
        </NuxtLink>
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
        @update:model-value="passwordError = false; verifyEmailAddress = null"
      />

      <AuthField
        v-model="password"
        label="Password"
        type="password"
        icon="amplif:lock"
        placeholder="Enter your password"
        autocomplete="current-password"
        :disabled="isSubmitting"
        :error="passwordError"
        error-message="Password is incorrect"
        :clearable="false"
        @update:model-value="passwordError = false"
      />

      <div class="flex justify-end -mt-1">
        <NuxtLink
          to="/sign-in/forgot-password"
          class="text-sm font-bold text-tertiary py-2"
        >
          Forgot password?
        </NuxtLink>
      </div>

      <div class="space-y-2 pt-8">
        <AuthPrimaryButton
          label="Log in"
          :disabled="!canSubmit"
          :loading="isSubmitting"
        />
        <p class="text-center text-sm text-secondary">
          Create an account?
          <NuxtLink
            to="/sign-up"
            class="font-bold text-tertiary px-2 py-1"
          >
            Sign Up
          </NuxtLink>
        </p>
      </div>
    </form>
  </AuthScreen>
</template>
