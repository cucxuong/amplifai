<script setup lang="ts">
const route = useRoute();
const store = useAgendaStore();

const item = computed(() =>
  store.items.find((i) => i.id === (route.params.id as string)),
);

watchEffect(() => {
  if (!item.value) navigateTo("/");
});
</script>

<template>
  <div
    v-if="item"
    id="checkin-success-page"
    class="h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <!-- Top bar -->
    <AppTopBar class="p-4 h-auto flex items-center justify-between">
      <span class="text-caption text-tertiary font-bold tracking-wide"
        >Checked in.</span
      >
      <GlassPanel
        as="button"
        type="button"
        :deg="-45"
        class="appearance-none outline-none! size-11 rounded-4xl p-0 bg-primary/5 grid place-content-center active:scale-110 select-none"
        @click="navigateTo('/')"
      >
        <Icon name="amplif:x" :size="18" />
      </GlassPanel>
    </AppTopBar>

    <!-- Main content -->
    <main
      class="overflow-y-auto overflow-x-clip flex flex-col items-center justify-center gap-7 px-5 py-6"
    >
      <!-- Hero: orange glow + glass circle + crystal sparkle -->
      <div class="relative flex items-center justify-center">
        <!-- Outer ambient orange glow -->
        <div
          class="absolute size-[240px] rounded-full pointer-events-none"
          style="
            background: radial-gradient(
              circle,
              rgba(255, 110, 0, 0.55) 0%,
              rgba(255, 60, 0, 0.2) 45%,
              transparent 70%
            );
            filter: blur(12px);
          "
        />
        <!-- Glass circle container -->
        <GlassPanel
          :deg="-20"
          class="relative size-36 rounded-full grid place-content-center"
          style="
            background: rgba(255, 255, 255, 0.06);
            --glass-border-one: rgba(255, 255, 255, 0.4);
            --glass-border-two: rgba(255, 255, 255, 0.15);
          "
        >
          <!-- Blue crystal sparkle -->
          <Icon
            name="amplif:ai"
            :size="72"
            style="
              color: #7dccff;
              filter: drop-shadow(0 0 14px rgba(100, 200, 255, 0.9))
                drop-shadow(0 0 4px rgba(200, 240, 255, 1));
            "
          />
        </GlassPanel>
      </div>

      <!-- Text -->
      <div class="text-center flex flex-col gap-1.5">
        <h1 class="text-[2rem] font-bold leading-tight">Checked in.</h1>
        <p
          class="text-[1.35rem] font-bold leading-snug"
          style="
            background: linear-gradient(135deg, #90daff 0%, #5aa8ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          "
        >
          +{{ item.sparks }} Sparks added<br />to your wallet
        </p>
      </div>

      <!-- Source card -->
      <GlassPanel
        :deg="-20"
        class="w-full flex flex-col overflow-hidden"
        style="
          background: rgba(255, 255, 255, 0.08);
          --glass-border-one: rgba(255, 255, 255, 0.35);
          --glass-border-two: rgba(255, 255, 255, 0.12);
        "
      >
        <!-- Session row -->
        <div class="flex items-center justify-between gap-3 p-4 pb-3">
          <div class="flex flex-col gap-1 min-w-0">
            <span
              class="text-[10px] leading-none tracking-[0.15em] uppercase font-bold text-tertiary"
              >Source</span
            >
            <span class="font-bold text-label leading-snug truncate">{{
              item.title
            }}</span>
          </div>
          <!-- Sparks count -->
          <div
            class="flex items-center gap-1 shrink-0"
            style="
              background: linear-gradient(135deg, #ff6e00, #ff003b);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            "
          >
            <span class="text-[1.25rem] font-bold leading-none"
              >+{{ item.sparks }}</span
            >
            <Icon name="amplif:ai-colored" :size="20" />
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-4 border-t border-primary/10" />

        <!-- View wallet link -->
        <NuxtLink
          to="/sparks"
          class="flex items-center gap-1.5 p-4 pt-3 font-bold text-label text-primary active:opacity-70 transition-opacity"
        >
          View Sparks wallet
          <Icon name="amplif:arrow-right" :size="16" />
        </NuxtLink>
      </GlassPanel>
    </main>

    <!-- Bottom CTA -->
    <AppBottomBar>
      <button
        type="button"
        class="appearance-none outline-none! w-full py-3.5 rounded-[20px] font-bold leading-6 text-center active:scale-[1.015] transition-all select-none text-surface"
        style="background: linear-gradient(135deg, #ff6e00 0%, #ff003b 100%)"
        @click="navigateTo('/')"
      >
        Back to agenda
      </button>
    </AppBottomBar>
  </div>
</template>
