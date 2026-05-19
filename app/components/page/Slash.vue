<script setup lang="ts">
const appStyles = inject('appStyles', ref({}))

onBeforeMount(() => {
  appStyles.value = {
    backgroundImage: 'url(/slash.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'top right',
    backgroundRepeat: 'no-repeat',
  }
})
</script>

<template>
  <div class="h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]">
    <AppTopBar>
      <GlassPanel class="bg-[hsl(233_81%_10%/0.4)] p-4 px-5 flex items-center justify-between gap-4">
        <NuxtImg
          src="/brand-logo.svg"
          alt="L'Oréal-ONESINGAPORE"
          width="88"
          height="26"
        />
        <NuxtImg
          src="/AmplifAI-logo.svg"
          alt="AmplifAI"
          width="97"
          height="22"
        />
      </GlassPanel>
    </AppTopBar>
    <main class="flex flex-col justify-end pt-[calc(50dvh+var(--app-min-scroll-top))]">
      <div class="flex flex-col items-center gap-2">
        <NuxtImg
          src="/AmplifAI-logo.svg"
          alt="AmplifAI"
          class="w-[80dvw]"
        />
        <div class="text-[20px] leading-[24px] font-sans font-normal">Powered by Tech & Data</div>
      </div>
      <div class="relative mt-8 mx-auto">
        <NuxtImg
          src="/slash-date-panel.png"
          alt="Date"
          width="164"
          height="79"
        />
        <div class="absolute inset-0 grid place-content-center text-[20px] leading-[24px] font-sans font-normal text-center pt-1 pl-3 pr-5 pb-4">
          02 - 05 June <br>
          Singapore
        </div>
      </div>

      <AppBottomBar class="mt-16 pb-4! space-y-4">
        <NuxtLink
          href="/sign-in"
          class="flex justify-center w-full outline-none! p-5 py-3.5 rounded-[20px] font-bold leading-[24px] active:scale-[1.015] select-none transition-all"
          style="background: linear-gradient(135deg, #FF6E00 0%, #FF003B 100%);"
        >
          Get started
        </NuxtLink>
        <div class="text-center text-caption text-pretty text-subtle *:inline-block">
          <span>INTERNAL · L'ORÉAL EMPLOYEES ONLY</span>
        </div>
      </AppBottomBar>
    </main>
  </div>
</template>
