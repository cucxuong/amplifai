<script setup lang="ts">
const { clear } = useUserSession()

async function signOut() {
  await clear()
  await navigateTo('/')
}

const { activeTab } = useHomeNav()
</script>

<template>
  <div
    id="home-page"
    class="h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <AppTopBar class="p-5 py-6 h-auto">
      <PageHomeUserSummary v-if="activeTab === AppNav.AGENDA"/>

      <GlassPanel
        v-else
        as="button"
        type="button"
        :deg="-45"
        class="appearance-none outline-none! size-11 shrink-0 rounded-4xl p-0 bg-primary/5 grid place-content-center active:scale-110 select-none"
        @click="activeTab = AppNav.AGENDA"
      >
        <Icon
          name="amplif:arrow-left"
          :size="24"
        />
      </GlassPanel>
    </AppTopBar>

    <PageHomeTabAgenda v-if="activeTab === AppNav.AGENDA" />

    <PageHomeTabProfile v-if="activeTab === AppNav.ME" />

    <AppBottomBar class="fixed bottom-0 inset-x-0 p-5 py-4">
      <PageHomeNavBar v-if="activeTab === AppNav.AGENDA" />
      <button
        v-if="activeTab === AppNav.ME"
        class="appearance-none outline-none! h-13 flex items-center justify-center text-center bg-primary/20 rounded-[20px] backdrop-blur-xs font-bold w-full mt-auto"
        @click="signOut"
      >
        Sign out
      </button>
    </AppBottomBar>
  </div>
</template>
