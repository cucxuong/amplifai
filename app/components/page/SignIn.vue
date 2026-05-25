<script setup lang="ts">
import { authErrorMessage } from '~/utils/auth-errors'

const route = useRoute()
const { public: { authBypass } } = useRuntimeConfig()

const isSubmitting = ref(false)
const formError = ref<string | null>(null)

watch(
  () => route.query.error,
  (error) => {
    formError.value = error === 'sso_failed'
      ? 'Microsoft sign-in failed. Try again.'
      : error === 'sso_not_configured'
        ? 'Sign-in is not configured yet. Contact IT or use dev bypass.'
        : null
  },
  { immediate: true },
)

async function signInWithMock() {
  formError.value = null
  isSubmitting.value = true
  try {
    await $fetch<{ ok: true }>('/api/auth/dev-session', { method: 'POST', credentials: 'include' })
    const ok = await refreshAuthSession()
    if (!ok) {
      formError.value = 'Session could not be started. Try again.'
      return
    }
    await navigateTo('/')
  }
  catch (err: unknown) {
    formError.value = authErrorMessage(err, 'Mock sign-in failed. Try again.')
  }
  finally {
    isSubmitting.value = false
  }
}

async function signInWithMicrosoft() {
  formError.value = null
  isSubmitting.value = true
  try {
    await navigateTo('/api/auth/microsoft', { external: true })
  }
  catch (err: unknown) {
    formError.value = authErrorMessage(err, 'Microsoft sign-in failed. Try again.')
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

    <div class="flex flex-col gap-4">
      <p
        v-if="formError"
        class="text-caption text-[#FF003B]"
        role="alert"
      >
        {{ formError }}
      </p>

      <button
        v-if="authBypass"
        :disabled="isSubmitting"
        class="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        @click="signInWithMock"
      >
        {{ isSubmitting ? 'Signing in…' : 'Sign in (dev mock)' }}
      </button>

      <AuthMicrosoftButton
        v-else
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="signInWithMicrosoft"
      />

      <div
        v-if="!authBypass"
        class="flex items-start gap-2"
      >
        <Icon
          name="amplif:alert-circle"
          :size="16"
          class="mt-0.5 shrink-0 text-secondary"
        />
        <div class="flex flex-col gap-0.5 text-caption">
          <p class="font-bold text-secondary">
            Need help signing in?
          </p>
          <p class="text-tertiary">
            Contact IT support · helpdesk@loreal.com
          </p>
        </div>
      </div>
    </div>
  </AuthScreen>
</template>
