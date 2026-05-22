<script setup lang="ts">
import { authErrorMessage, authErrorStatus } from '~/utils/auth-errors'

const route = useRoute()

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

async function signInWithMicrosoft() {
  formError.value = null
  isSubmitting.value = true

  try {
    const devSession = await $fetch<{ ok: true }>('/api/auth/dev-session', {
      method: 'POST',
      credentials: 'include',
    }).catch((err: unknown) => {
      if (authErrorStatus(err) === 403)
        return null
      throw err
    })

    if (devSession) {
      const ok = await refreshAuthSession()
      if (!ok) {
        formError.value = 'Session could not be started. Try again.'
        return
      }

      await navigateTo('/')
      return
    }

    await navigateTo('/api/auth/saml/login', { external: true })
  }
  catch (err: unknown) {
    formError.value = authErrorMessage(err, 'Microsoft sign-in failed. Try again.')
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

    <div class="flex flex-col gap-4">
      <p
        v-if="formError"
        class="text-caption text-[#FF003B]"
        role="alert"
      >
        {{ formError }}
      </p>

      <AuthMicrosoftButton
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="signInWithMicrosoft"
      />

      <div class="flex items-start gap-2">
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
