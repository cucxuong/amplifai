<script setup lang="ts">
interface ActivityItem {
  id: number;
  title: string;
  date: string;
  time: string | null;
  sparks: number;
}

const activities: ActivityItem[] = [
  {
    id: 1,
    title: "Redeem L'Oréal Tee",
    date: "Today",
    time: "10:42",
    sparks: -100,
  },
  {
    id: 2,
    title: "Agentic AI check-in",
    date: "Today",
    time: "10:42",
    sparks: 20,
  },
  {
    id: 3,
    title: "Bot or Not — 3 correct",
    date: "Today",
    time: "09:30",
    sparks: 15,
  },
  {
    id: 4,
    title: "Vote on AI artwork",
    date: "Yesterday",
    time: null,
    sparks: 10,
  },
  {
    id: 5,
    title: "Opening keynote check-in",
    date: "Tuesday",
    time: "10:00",
    sparks: 30,
  },
];

const totalEarned = 240;
const currentScore = 180;
const maxScore = 240;

const { goBack } = useAppBack('/agenda');
</script>

<template>
  <div
    id="sparks-page"
    class="page-content h-dvh flex flex-col"
  >
    <!-- Score header — sits on top of the body background image -->
    <div class="flex flex-col shrink-0 px-5 pb-8">
      <!-- Back button -->
      <AppTopBar class="px-0">
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

      <!-- Rank badge -->
      <div
        class="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full mt-14 mb-5"
        style="background: linear-gradient(135deg, #ff6e00 0%, #ff003b 100%)"
      >
        <NuxtImg
          src="/rank-star.png"
          class="size-6 object-contain"
        />
        <span
          class="text-caption uppercase tracking-wide font-black text-[14px]"
        >Rank #14</span>
      </div>

      <!-- Label -->
      <div
        class="text-[16px] leading-[14px] text-secondary uppercase tracking-widest mb-2"
      >
        Sparks Score
      </div>

      <!-- Score number -->
      <div class="flex items-center gap-2 mb-2">
        <span
          class="font-bold leading-none"
          style="font-size: 42px"
        >{{
          currentScore
        }}</span>
        <span
          class="text-secondary leading-none"
          style="font-size: 42px"
        >/{{ maxScore }}</span>
        <NuxtImg
          src="/activity-star.png"
          class="size-10 object-cover shrink-0"
        />
      </div>

      <!-- Subtitle -->
      <div class="text-caption text-secondary text-[16px]">
        Total earned {{ totalEarned }} sparks
      </div>
    </div>

    <!-- Activity card — white, rounded top, scrollable -->
    <div class="flex-1 bg-white overflow-y-auto px-5 pt-6 pb-10 min-h-0">
      <h2 class="font-bold text-[24px] leading-[32px] text-[#0B0F17] mb-2">
        Activity
      </h2>

      <div class="flex flex-col">
        <div
          v-for="item in activities"
          :key="item.id"
          class="flex items-center gap-3 py-4 border-b border-primary/10 last:border-0"
        >
          <!-- Icon -->
          <div
            class="size-11 rounded-full shrink-0 grid place-content-center"
            style="
              background: linear-gradient(135deg, #e8f0ff 0%, #c7daff 100%);
            "
          >
            <NuxtImg
              src="/activity-star.png"
              class="size-10 object-cover"
            />
          </div>

          <!-- Title + time -->
          <div class="flex flex-col flex-1 min-w-0 gap-0.5">
            <span
              class="text-[14px] leading-[18px] font-bold text-[#0B0F17] truncate mb-1"
            >
              {{ item.title }}
            </span>
            <span class="text-caption text-[#0B0F17]">
              {{ item.date
              }}<template v-if="item.time"> · {{ item.time }} </template>
            </span>
          </div>

          <!-- Sparks delta -->
          <div class="flex flex-col items-end shrink-0 gap-0.5">
            <!-- Positive: orange→red gradient; Negative: solid red -->
            <div
              v-if="item.sparks >= 0"
              class="flex items-center gap-0.5 font-bold text-[16px] leading-[18px]"
              style="
                background: linear-gradient(135deg, #ff6e00 0%, #ff003b 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              "
            >
              <span>+{{ item.sparks }}</span>
              <Icon
                name="amplif:ai-colored"
                :size="14"
              />
            </div>
            <div
              v-else
              class="flex items-center gap-0.5 font-bold text-[14px] leading-[18px] text-[#FF003B]"
            >
              <span>{{ item.sparks }}</span>
              <Icon
                name="amplif:ai-colored"
                :size="14"
              />
            </div>
            <span class="text-caption text-[#0B0F17]">Sparks</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
