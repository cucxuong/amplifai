<script setup lang="ts">
const route = useRoute()
const { clear } = useUserSession()
const { goBack } = useAppBack('/agenda')

const isAgendaHome = computed(() => route.path === '/agenda')
const isMe = computed(() => route.path.startsWith('/me'))
const isGift = computed(() => route.path.startsWith('/gift'))
const showNavBar = computed(() => isAgendaHome.value)

async function signOut() {
  useCurrentUserStore().clearSchedule()
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div
    id="home-page"
    class="h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <header class="shell-chrome">
      <AppTopBar class="p-5 py-6 h-auto">
        <PageHomeUserSummary v-if="isAgendaHome" />

        <GlassPanel
          v-else-if="isMe || isGift"
          as="button"
          type="button"
          :deg="-45"
          class="appearance-none outline-none! size-11 shrink-0 rounded-4xl p-0 bg-primary/5 grid place-content-center active:scale-110 select-none"
          @click="goBack"
        >
          <Icon
            name="amplif:arrow-left"
            :size="24"
          />
        </GlassPanel>
      </AppTopBar>
    </header>

    <main class="page-content min-h-0 overflow-hidden">
      <slot />
    </main>

    <footer
      v-if="!isGift"
      class="shell-chrome fixed bottom-0 inset-x-0 z-10"
    >
      <AppBottomBar class="p-5 py-4">
        <PageHomeNavBar v-if="showNavBar" />
        <button
          v-if="isMe"
          type="button"
          class="appearance-none outline-none! h-13 flex items-center justify-center text-center bg-primary/20 rounded-[20px] backdrop-blur-xs font-bold w-full mt-auto"
          @click="signOut"
        >
          Sign out
        </button>
      </AppBottomBar>
    </footer>
  </div>
</template>
