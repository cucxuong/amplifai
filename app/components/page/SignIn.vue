<script setup lang="ts">
const step = ref<'intro' | 'email'>('intro')
const email = ref('guest@loreal.com')
const isSubmitting = ref(false)
const fieldError = ref<string | null>(null)

const emailInput = useTemplateRef<HTMLInputElement>('emailInput')

function showEmailForm() {
  fieldError.value = null
  step.value = 'email'
  nextTick(() => {
    emailInput.value?.focus()
  })
}

async function submitEmail() {
  fieldError.value = null
  const value = email.value.trim()
  if (!value) {
    fieldError.value = 'Enter your email address.'
    return
  }

  isSubmitting.value = true
  try {
    await $fetch('/api/auth/email', {
      method: 'POST',
      body: { email: value },
      credentials: 'include',
    })

    const { fetch: fetchSession, loggedIn } = useUserSession()
    await fetchSession()

    if (!loggedIn.value) {
      fieldError.value = 'Session could not be started. Check connection and try again.'
      return
    }

    await navigateTo('/')
  }
  catch (err: unknown) {
    const message = err && typeof err === 'object' && 'data' in err
      && err.data && typeof err.data === 'object' && 'message' in err.data
      ? String(err.data.message)
      : 'Sign in failed. Try again.'
    fieldError.value = message
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    id="sign-in-page"
    class="h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <AppTopBar>
      <NuxtLink
        href="/"
        prefetch
        role="button"
        class="appearance-none outline-none! size-11 shrink-0 rounded-4xl p-0 glass-panel [--light-deg:-45deg] bg-primary/5 grid place-content-center active:scale-110 select-none"
      >
        <Icon
          name="amplif:arrow-left"
          :size="24"
        />
      </NuxtLink>
    </AppTopBar>
    <main class="space-y-9 p-4 py-5">
      <div class="space-y-2">
        <h2 class="text-heading">
          Sign in
        </h2>
        <p class="text-secondary">
          Welcome back to AmplifAI.
        </p>
      </div>

      <div
        v-if="step === 'intro'"
        class="space-y-4"
      >
        <GlassPanel
          as="button"
          type="button"
          class="p-4 pr-3.5 appearance-none outline-none! bg-primary/5 transition-all active:scale-[1.015] flex w-full items-center justify-between gap-3 text-left"
          :deg="-30"
          @click="showEmailForm"
        >
          <Icon
            name="amplif:profile"
            :size="36"
          />
          <div class="flex flex-col flex-1 gap-1">
            <span class="font-bold">Continue with email</span>
            <span class="text-caption text-secondary leading-[14px]">Sign in with your work email</span>
          </div>
          <Icon
            name="amplif:arrow-right"
            :size="24"
          />
        </GlassPanel>
      </div>

      <form
        v-else
        class="space-y-4"
        @submit.prevent="submitEmail"
      >
        <p
          v-if="fieldError"
          class="text-caption text-red-400"
          role="alert"
        >
          {{ fieldError }}
        </p>
        <label class="glass-panel flex items-center h-14 rounded-xl p-3 px-4 bg-primary/5">
          <input
            ref="emailInput"
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            inputmode="email"
            required
            placeholder="Enter your email"
            class="appearance-none outline-none!"
            :disabled="isSubmitting"
          >
        </label>
        <button
          type="submit"
          class="flex justify-center w-full outline-none! p-5 py-3.5 rounded-[20px] font-bold leading-[24px] active:scale-[1.015] select-none transition-all not-disabled:bg-[linear-gradient(135deg,#FF6E00,#FF003B)] disabled:bg-subtle disabled:text-muted"
          :disabled="!email || isSubmitting"
        >
          Continue
        </button>
      </form>

      <div class="flex gap-2 select-none">
        <Icon
          name="amplif:alert-circle"
          :size="16"
        />
        <div class="flex flex-col flex-1 text-caption gap-0.5">
          <span class="font-bold text-secondary">Need help signing in?</span>
          <span class="text-tertiary">Contact IT support · helpdesk@loreal.com</span>
        </div>
      </div>
    </main>
    <AppBottomBar>
      <div class="text-center text-caption text-pretty text-subtle *:inline-block">
        <strong>Privacy & data:</strong> <span>Session-only sign-in.</span> <span>Data deleted 30 days post-event.</span>
      </div>
    </AppBottomBar>
  </div>
</template>
