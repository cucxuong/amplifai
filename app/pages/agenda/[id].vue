<script setup lang="ts">
definePageMeta({
  viewTransition: stackViewTransition,
});

const route = useRoute();
const store = useAgendaStore();
const { goBack } = useAppBack('/agenda');
const { isInUserCalendar, toggleSchedule: toggleUserSchedule } =
  useAgendaSchedule();

const item = computed(() =>
  store.items.find((i) => i.id === (route.params.id as string)),
);

watchEffect(() => {
  if (!item.value) navigateTo('/agenda');
});

/**
 * Show LIVE NOW badge when:
 * 1. The item is genuinely live right now (real clock check), OR
 * 2. The item is the first of its day in the agenda (mirrors the AgendaCard
 *    list where :live="index === 0" always marks the top card as live).
 */
const isLive = computed(() => {
  if (!item.value || item.value.alwaysOn) return false;
  if (store.isAgendaItemLive(item.value)) return true;
  const date = item.value.startAt.slice(0, 10);
  const dayItems = store.itemsByDate(date);
  return dayItems[0]?.id === item.value.id;
});

const startDate = computed(() =>
  item.value ? new Date(item.value.startAt) : new Date(),
);
const endDate = computed(() =>
  item.value ? new Date(item.value.endAt) : new Date(),
);

const formattedDay = useDateFormat(startDate, "dddd, MMMM D");
const formattedStart = useDateFormat(startDate, "h:mm A");
const formattedEnd = useDateFormat(endDate, "h:mm A");

const isInMySchedule = computed(() =>
  item.value ? isInUserCalendar(item.value) : false,
);

function toggleSchedule() {
  if (item.value) toggleUserSchedule(item.value.id);
}

function handleCheckIn() {
  if (!item.value) return;
  navigateTo(`/scan/${item.value.id}`);
}
</script>

<template>
  <div
    v-if="item"
    id="agenda-detail-page"
    class="page-content h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <!-- Top bar -->
    <AppTopBar class="p-4 h-auto flex items-center">
      <GlassPanel
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

    <!-- Scrollable content -->
    <main
      class="overflow-y-auto overflow-x-clip px-5 flex flex-col gap-5 pt-3 pb-6"
    >
      <!-- Live badge -->
      <div
        v-if="isLive"
        class="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full font-bold text-caption tracking-widest leading-none select-none"
        style="background: linear-gradient(135deg, #ff6e00 0%, #ff003b 100%)"
      >
        <Icon
          name="amplif:dot"
          :size="8"
        />
        <span class="text-[12px] text-secondary"> LIVE NOW </span>
      </div>

      <!-- Title -->
      <h1 class="text-[2rem] leading-[1.15] font-bold text-tertiary">
        {{ item.title }}
      </h1>

      <!-- Description -->
      <p class="text-secondary leading-relaxed text-[16px]">
        {{
          item.description ??
            "Join us for this session at L'Oréal ONE SINGAPORE."
        }}
      </p>

      <!-- Sparks badge — cyan/electric-blue matching Figma -->
      <div
        :deg="0"
        class="self-start inline-flex items-center gap-1 px-2 py-1.5 rounded-[8px]"
        style="background: #ccf3ff"
      >
        <NuxtImg
          src="/agenda-star.png"
          class="size-4 object-contain"
        />
        <span
          class="font-bold text-label tracking-wide leading-none"
          style="background: #ccf3ff; color: #0057ff"
        ><b>+{{ item.sparks }} SPARKS</b> ON CHECK-IN</span>
      </div>

      <!-- Divider -->
      <div class="border-t border-primary/10" />

      <!-- Speaker -->
      <div class="flex items-center gap-4">
        <div
          class="size-14 rounded-full overflow-hidden outline-2 outline-primary/10 shrink-0"
        >
          <NuxtImg
            :src="item.speakerImage"
            :alt="item.speaker"
            class="size-full object-cover object-center"
          />
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="font-bold text-base leading-snug">{{
            item.speaker
          }}</span>
          <span class="text-caption text-secondary">
            <template v-if="item.speakerTitle">{{
              item.speakerTitle
            }}</template>
            <template v-if="item.speakerTitle && item.speakerOrg"> · </template>
            <template v-if="item.speakerOrg">{{ item.speakerOrg }}</template>
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-primary/10" />

      <!-- Date & Location -->
      <div class="flex flex-col gap-5">
        <!-- Date -->
        <div class="flex items-start gap-3.5">
          <Icon
            name="amplif:calendar-2"
            :size="24"
            class="shrink-0 mt-0.5"
          />
          <div class="flex flex-col gap-0.5">
            <span class="font-bold leading-snug">{{ formattedDay }}</span>
            <span class="text-caption text-secondary">{{ formattedStart }} - {{ formattedEnd }}</span>
          </div>
        </div>

        <!-- Location -->
        <div class="flex items-start gap-3.5">
          <Icon
            name="amplif:map-pin"
            :size="24"
            class="shrink-0 mt-0.5"
          />
          <div class="flex flex-col gap-0.5">
            <span class="font-bold leading-snug">{{
              item.location ?? item.stage ?? "Main Stage"
            }}</span>
            <span
              v-if="item.locationDetail"
              class="text-caption text-secondary"
            >{{ item.locationDetail }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom CTA -->
    <AppBottomBar class="flex flex-col gap-3">
      <button
        type="button"
        class="appearance-none outline-none! w-full py-3.5 rounded-[20px] font-bold leading-6 text-center active:scale-[1.015] transition-all select-none text-white"
        style="background: linear-gradient(135deg, #ff6e00 0%, #ff003b 100%)"
        @click="handleCheckIn"
      >
        Scan QR to check in
      </button>
      <button
        type="button"
        class="appearance-none outline-none! w-full py-2 text-center font-bold leading-6 active:opacity-70 transition-opacity select-none"
        :class="isInMySchedule ? 'text-subtle' : 'text-primary'"
        @click="toggleSchedule"
      >
        {{ isInMySchedule ? "Remove from my schedule" : "Save to my schedule" }}
      </button>
    </AppBottomBar>
  </div>
</template>
