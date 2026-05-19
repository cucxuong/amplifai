<script setup lang="ts">
const { loggedIn, session } = useUserSession()

const showPickPersona = computed(
  () => loggedIn.value && !session.value?.onboardingComplete,
)
</script>

<template>
  <PageSlash v-if="!loggedIn" />
  <PagePickPersona v-else-if="showPickPersona" />
  <PageHome v-else />
</template>
