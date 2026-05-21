<script setup lang="ts">
const props = defineProps<{
  item: AgendaItem;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div
    id="agenda-checkin-page"
    class="h-full min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <!-- Top bar -->
    <AppTopBar class="p-4 h-auto flex items-center justify-end">
      <GlassPanel
        as="button"
        type="button"
        :deg="-45"
        class="appearance-none outline-none! size-11 rounded-4xl p-0 bg-primary/5 grid place-content-center active:scale-110 select-none"
        @click="emit('close')"
      >
        <Icon
          name="amplif:x"
          :size="18"
        />
      </GlassPanel>
    </AppTopBar>

    <!-- Main content -->
    <main
      class="overflow-y-auto overflow-x-clip flex flex-col items-center gap-2"
    >
      <!-- Hero: orange glow + glass circle + crystal sparkle -->
      <NuxtImg
        src="/successful-star.svg"
        class="size-full object-contain h-fit w-[300px]"
      />

      <!-- Text -->
      <div class="text-center flex flex-col gap-1">
        <h1 class="text-[2rem] font-bold leading-tight text-primary">
          Checked in.
        </h1>
        <p
          class="text-[2rem] font-bold leading-snug text-[#669AFF]"
          style="
            background: linear-gradient(135deg, #90daff 0%, #5aa8ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          "
        >
          +{{ props.item.sparks }} Sparks added<br >to your wallet
        </p>
      </div>

      <!-- Source card -->
      <div class="px-6 w-full mt-12">
        <GlassPanel
          :deg="-20"
          style="
            background: rgba(255, 255, 255, 0.08);
            --glass-border-one: rgba(255, 255, 255, 0.35);
            --glass-border-two: rgba(255, 255, 255, 0.12);
          "
        >
          <!-- Session row -->
          <div class="flex items-center justify-between gap-3 p-6 pb-6">
            <div class="flex flex-col gap-1 min-w-0">
              <span
                class="text-[10px] leading-none tracking-[0.15em] uppercase font-bold text-tertiary"
              >Source</span>
              <span class="font-bold text-label leading-snug truncate">{{
                props.item.title
              }}</span>
            </div>
            <!-- Sparks count -->
            <div class="flex items-center gap-1 shrink-0">
              <span class="text-[2rem] font-bold leading-none text-primary">+{{ props.item.sparks }}</span>
              <NuxtImg
                src="/activity-star.png"
                class="size-8 object-cover"
              />
            </div>
          </div>

          <!-- Divider -->
          <div class="mx-4 border-t border-primary/10" />

          <!-- View wallet link -->
          <NuxtLink
            to="/sparks"
            class="flex items-center justify-center gap-1.5 p-4 pt-3 font-bold text-label active:opacity-70 transition-opacity text-tertiary"
            @click="emit('close')"
          >
            View Sparks wallet
            <Icon
              name="amplif:arrow-right"
              :size="16"
            />
          </NuxtLink>
        </GlassPanel>
      </div>
    </main>

    <!-- Bottom CTA -->
    <AppBottomBar>
      <UiCTAButton @click="emit('close')">
        Back to agenda
      </UiCTAButton>
    </AppBottomBar>
  </div>
</template>
