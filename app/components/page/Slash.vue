<script setup lang="ts">
const { width, height } = useWindowSize()
const isPortrait = computed(() => height.value >= width.value)
</script>

<template>
  <div
    id="slash-page"
    class="h-full min-h-0 grid grid-rows-[auto_minmax(0,1fr)]"
  >
    <AppTopBar class="px-4 py-2.5">
      <GlassPanel class="bg-[rgba(5,10,48,0.4)] p-4 px-5 flex items-center justify-between gap-4">
        <NuxtImg
          src="/brand-logo.svg"
          alt="L'Oréal-ONESINGAPORE"
          width="88"
          height="26"
          preload
        />
        <NuxtImg
          src="/AmplifAI-logo.svg"
          alt="AmplifAI"
          width="97"
          height="22"
          preload
        />
      </GlassPanel>
    </AppTopBar>

    <main
      class="flex flex-col overflow-y-auto overflow-x-clip"
      :class="isPortrait ? 'justify-end pt-[calc(50dvh+var(--app-min-scroll-top))] pb-[min(4rem,10dvh)]' : 'justify-center py-8'"
    >
      <div class="flex flex-col items-center gap-2">
        <NuxtImg
          src="/AmplifAI-logo.svg"
          alt="AmplifAI"
          class="w-[min(22rem,80dvw)]"
        />
        <div class="text-[20px] leading-[24px] font-sans font-normal">
          Powered by Tech & Data
        </div>
      </div>

      <GlassPanel
        class="mt-8 mx-auto rounded-md p-2 px-3 bg-[hsl(233_81_10/0.2)] text-[20px] leading-[24px] font-sans font-normal text-center"
        :deg="-30"
      >
        <div class="absolute rounded-[inherit] bg-primary/5" />

        02 - 05 June <br>
        Singapore
      </GlassPanel>
      <AppBottomSpacer />
    </main>

    <AppFixedBottom class="px-4">
      <AppBottomBar class="space-y-4">
        <UiCTAButton
          to="/sign-in"
          prefetch
        >
          Get started
        </UiCTAButton>
        <NuxtLink
          to="/privacy"
          prefetch
          class="block rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-center text-sm font-bold text-primary active:opacity-80"
        >
          Read our Privacy Notice
        </NuxtLink>
        <div class="text-center text-caption text-pretty text-subtle">
          INTERNAL · L'ORÉAL EMPLOYEES ONLY
        </div>
      </AppBottomBar>
    </AppFixedBottom>
  </div>
</template>
