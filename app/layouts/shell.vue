<script setup lang="ts">
const route = useRoute()
const { clear } = useUserSession()
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
    class="flex flex-col h-full min-h-0"
    :class="{ 'overflow-y-auto overflow-x-clip overscroll-contain': !isAgendaHome }"
  >
    <AppTopBar
      class="shell-header z-20 p-5 py-6 h-auto"
      :class="{ 'sticky top-0': !isAgendaHome }"
    >
      <PageHomeUserSummary v-if="isAgendaHome" />

      <UiBackButton
        v-else-if="isMe || isGift"
        fallback="/agenda"
      />
    </AppTopBar>

    <main
      class="page-content relative min-h-0"
      :class="{ 'overflow-y-auto overflow-x-clip overscroll-contain': isAgendaHome }"
    >
      <slot />
      <AppBottomSpacer />
    </main>

    <AppFixedBottom class="shell-nav px-4 pt-4">
      <AppBottomBar>
        <PageHomeNavBar v-if="showNavBar" />
        
        <button
          v-if="isMe"
          type="button"
          class="appearance-none outline-none! h-13 flex items-center justify-center text-center bg-primary/20 rounded-[20px] font-bold w-full mt-auto"
          @click="signOut"
        >
          Sign out
        </button>
      
        <div
          v-if="isGift"
          class="flex flex-col gap-4"
        >
          <UiCTAButton
            size="lg"
            @click="navigateTo('/scan')"
          >
            Scan QR code
          </UiCTAButton>
          <p class="text-caption leading-4 text-secondary text-center">
            ✨ Bonus: Redeeming prizes will NOT impact your final leaderboard score.
          </p>
        </div>
      </AppBottomBar>
    </AppFixedBottom>
  </div>
</template>
