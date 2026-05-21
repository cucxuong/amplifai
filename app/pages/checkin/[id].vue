<script setup lang="ts">

const route = useRoute();
const agendaStore = useAgendaStore();
const qrStore = useQrCampaignsStore();

const routeId = computed(() => route.params.id as string);

const agendaItem = computed(() =>
  agendaStore.items.find((i) => i.id === routeId.value),
);

const campaign = computed(() => qrStore.getByCode(routeId.value));

const sourceTitle = computed(
  () => agendaItem.value?.title ?? campaign.value?.name ?? "",
);
const sparksEarned = computed(
  () => agendaItem.value?.sparks ?? campaign.value?.sparks ?? 0,
);

const isValid = computed(() => Boolean(agendaItem.value || campaign.value));

watchEffect(() => {
  if (!isValid.value) navigateTo("/");
});
</script>

<template>
  <div
    v-if="isValid"
    id="checkin-success-page"
    class="page-content h-full min-h-0 grid grid-rows-[auto_minmax(0,1fr)]"
  >
    <!-- Top bar -->
    <AppTopBar class="p-4 h-auto flex items-center justify-between">
      <span class="text-caption text-tertiary font-bold tracking-wide">Checked in.</span>
      <GlassPanel
        as="button"
        type="button"
        :deg="-45"
        class="appearance-none outline-none! size-11 rounded-4xl p-0 bg-primary/5 grid place-content-center active:scale-110 select-none"
        @click="navigateTo('/')"
      >
        <Icon
          name="amplif:x"
          :size="18"
        />
      </GlassPanel>
    </AppTopBar>

    <!-- Main content -->
    <main
      class="overflow-y-auto overflow-x-clip flex flex-col items-center justify-center gap-7 px-5 py-6"
    >
      <NuxtImg
        src="/successful-star.svg"
        class="size-full object-contain h-fit w-[300px]"
        alt=""
      />

      <div class="text-center flex flex-col gap-1">
        <h1 class="text-[2rem] font-bold leading-tight text-primary">
          Checked in.
        </h1>
        <p
          class="text-[2rem] font-bold leading-snug"
          style="
            background: linear-gradient(135deg, #90daff 0%, #5aa8ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          "
        >
          +{{ sparksEarned }} Sparks added<br>to your wallet
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
            >Source</span>
            <span class="font-bold text-label leading-snug truncate">{{
              sourceTitle
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
            <span class="text-[2rem] font-bold leading-none text-primary">+{{ sparksEarned }}</span>
            <NuxtImg
              src="/activity-star.png"
              class="size-8 object-cover"
              alt=""
            />
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-4 border-t border-primary/10" />

        <!-- View wallet link -->
        <NuxtLink
          to="/sparks"
          class="flex items-center justify-center gap-1.5 p-4 pt-3 font-bold text-label active:opacity-70 transition-opacity text-tertiary"
        >
          View Sparks wallet
          <Icon
            name="amplif:arrow-right"
            :size="16"
          />
        </NuxtLink>
      </GlassPanel>
      <AppBottomSpacer />
    </main>

    <AppFixedBottom class="px-5 pt-2">
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
    </AppFixedBottom>
  </div>
</template>
