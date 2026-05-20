<script setup lang="ts">
const { loggedIn, session } = useUserSession()

const showPickPersona = computed(
  () => loggedIn.value && !session.value?.onboardingComplete,
)

const shouldRedirectToAgenda = computed(
  () => loggedIn.value && session.value?.onboardingComplete,
)

watchEffect(() => {
  if (shouldRedirectToAgenda.value)
    navigateTo('/agenda', { replace: true })
})
</script>

<template>
  <PageSlash v-if="!loggedIn" />
  <PagePickPersona v-else-if="showPickPersona" />
</template>
