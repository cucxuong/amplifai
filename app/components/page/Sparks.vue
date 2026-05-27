<script setup lang="ts">
const { activities, currentScore, totalEarned, rank, loading, error, refresh } =
  useSparks();

const maxScore = computed(() =>
  Math.max(totalEarned.value, currentScore.value, 1),
);
</script>

<template>
  <div id="sparks-page" class="page-content h-full min-h-0 flex flex-col">
    <div class="flex flex-col shrink-0 px-5 pb-8">
      <AppTopBar class="px-0">
        <UiBackButton fallback="/agenda" />
      </AppTopBar>

      <AppMinisiteUnavailableBanner class="mt-2" />

      <div
        class="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full mt-14 mb-5"
        style="background: linear-gradient(135deg, #ff6e00 0%, #ff003b 100%)"
      >
        <NuxtImg src="/rank-star.png" class="size-6 object-contain" />
        <span
          class="text-caption uppercase tracking-wide font-black text-[14px]"
          >Rank #{{ loading && !currentScore ? "—" : (rank ?? "—") }}</span
        >
      </div>

      <div
        class="text-[16px] leading-[14px] text-secondary uppercase tracking-widest mb-2"
      >
        Sparks Score
      </div>

      <div class="flex items-center gap-2 mb-2">
        <span class="font-bold leading-none" style="font-size: 42px">{{
          loading && !currentScore ? "—" : currentScore
        }}</span>
        <span class="text-secondary leading-none" style="font-size: 42px"
          >/{{ maxScore }}</span
        >
        <NuxtImg
          src="/activity-star.png"
          class="size-10 object-cover shrink-0"
        />
      </div>

      <div class="text-caption text-secondary text-[16px]">
        Total earned {{ loading && !totalEarned ? "—" : totalEarned }} sparks
      </div>
      <div class="text-caption text-secondary text-[16px]">
        Once you collect 400 sparks, you will enter into a lucky draw. Draw will
        be conducted in June and you will be contacted by HR if you are a
        winner!
      </div>
    </div>

    <div class="flex-1 bg-white overflow-y-auto px-5 pt-6 pb-10 min-h-0">
      <h2 class="font-bold text-[24px] leading-[32px] text-[#0B0F17] mb-2">
        Activity
      </h2>

      <div
        v-if="loading && activities.length === 0"
        class="py-8 text-center text-secondary text-label"
      >
        Loading activity…
      </div>

      <div v-else-if="error" class="py-8 flex flex-col items-center gap-3">
        <p class="text-caption text-secondary text-center">
          {{ error }}
        </p>
        <button
          type="button"
          class="text-label font-bold text-primary underline"
          @click="refresh()"
        >
          Retry
        </button>
      </div>

      <p
        v-else-if="activities.length === 0"
        class="py-8 text-center text-caption text-secondary"
      >
        No activity yet — check in to sessions to earn Sparks.
      </p>

      <div v-else class="flex flex-col">
        <div
          v-for="item in activities"
          :key="item.id"
          class="flex items-center gap-3 py-4 border-b border-primary/10 last:border-0"
        >
          <div
            class="size-11 rounded-full shrink-0 grid place-content-center"
            style="
              background: linear-gradient(135deg, #e8f0ff 0%, #c7daff 100%);
            "
          >
            <NuxtImg src="/activity-star.png" class="size-10 object-cover" />
          </div>

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

          <div class="flex flex-col items-end shrink-0 gap-0.5">
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
              <NuxtImg src="/ai-colored.svg" class="size-4 object-cover" />
            </div>
            <div
              v-else
              class="flex items-center gap-0.5 font-bold text-[14px] leading-[18px] text-[#FF003B]"
            >
              <span>{{ item.sparks }}</span>
              <NuxtImg src="/ai-colored.svg" class="size-4 object-cover" />
            </div>
            <span class="text-caption text-[#0B0F17]">Sparks</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
