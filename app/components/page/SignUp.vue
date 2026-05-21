<script setup lang="ts">
import { authErrorMessage } from '~/utils/auth-errors'

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const emailError = ref(false)
const formError = ref<string | null>(null)

const canSubmit = computed(
  () =>
    firstName.value.trim()
    && lastName.value.trim()
    && email.value.trim()
    && password.value.length >= 6
    && !isSubmitting.value,
)

async function submitSignUp() {
  emailError.value = false
  formError.value = null
  isSubmitting.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        password: password.value,
      },
    })

    await navigateTo({
      path: '/sign-up/verify-email',
      query: { email: email.value.trim() },
      replace: true,
    })
  }
  catch (err: unknown) {
    const message = authErrorMessage(err, 'Sign up failed. Try again.')
    if (message.includes('already registered')) {
      emailError.value = true
    }
    else {
      formError.value = message
    }
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AuthScreen
    page-id="sign-up-page"
    back-fallback="/sign-in"
  >
    <div class="space-y-2">
      <h2 class="text-heading">
        Create new account
      </h2>
      <p class="text-secondary">
        To create an account provide details verify email and set a password
      </p>
    </div>

    <form
      class="space-y-0"
      @submit.prevent="submitSignUp"
    >
      <p
        v-if="formError"
        class="text-caption text-[#FF003B] mb-2"
        role="alert"
      >
        {{ formError }}
      </p>

      <AuthField
        v-model="firstName"
        label="First name"
        icon="amplif:user"
        placeholder="Enter your first name"
        autocomplete="given-name"
        :disabled="isSubmitting"
      />

      <AuthField
        v-model="lastName"
        label="Last name"
        icon="amplif:user"
        placeholder="Enter your last name"
        autocomplete="family-name"
        :disabled="isSubmitting"
      />

      <AuthField
        v-model="email"
        label="Email Address"
        type="email"
        icon="amplif:mail"
        placeholder="Enter your email"
        autocomplete="email"
        inputmode="email"
        :disabled="isSubmitting"
        :error="emailError"
        error-message="This email is already registered"
        @update:model-value="emailError = false"
      />

      <AuthField
        v-model="password"
        label="Password"
        type="password"
        icon="amplif:lock"
        placeholder="Enter your password"
        autocomplete="new-password"
        :disabled="isSubmitting"
        :clearable="false"
      />

      <div class="space-y-2 pt-8">
        <AuthPrimaryButton
          label="Sign Up"
          :disabled="!canSubmit"
          :loading="isSubmitting"
        />
        <p class="text-center text-sm text-secondary">
          Have an account?
          <NuxtLink
            to="/sign-in"
            class="font-bold text-tertiary px-2 py-1"
          >
            Log in
          </NuxtLink>
        </p>
      </div>
    </form>
  </AuthScreen>
</template>
