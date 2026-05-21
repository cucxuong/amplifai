<script setup lang="ts">
const infoRows = [
  {
    icon: 'amplif:gift',
    text: 'Every reward comes with its own point value — choose wisely 👀',
  },
  {
    icon: 'amplif:scan-bold',
    html: 'Visit the redemption booth at <strong>Level 47</strong> and scan the QR code on the tablet to claim your prize.',
  },
  {
    icon: 'amplif:ai-colored',
    text: 'Keep earning points throughout the experience to unlock even more rewards!',
  },
] as const
</script>

<template>
  <div
    id="gift-page"
    class="page-content h-full min-h-0 flex flex-col overflow-y-auto overflow-x-clip"
  >
    <div class="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-6">
      <div class="relative size-[203px] shrink-0">
        <div class="absolute inset-0 rounded-full glass-panel bg-primary/5" />
        <div class="absolute inset-[16px] rounded-full glass-panel bg-primary/10 grid place-content-center overflow-hidden">
          <NuxtImg
            src="/gift-box.png"
            alt=""
            class="size-[184px] object-contain"
          />
        </div>
      </div>

      <div class="flex flex-col gap-12 w-full max-w-[358px]">
        <div class="flex flex-col gap-1 text-center">
          <h1 class="text-[32px] leading-9 font-bold text-primary">
            UNLOCK YOUR AI REWARDS 🚀
          </h1>
          <p class="text-base leading-5 text-tertiary">
            Turn your points into exclusive prizes!
          </p>
        </div>

        <ul class="flex flex-col gap-5 px-4">
          <li
            v-for="(row, index) in infoRows"
            :key="index"
            class="flex gap-3 items-start"
          >
            <Icon
              :name="row.icon"
              :size="28"
              class="shrink-0"
            />
            <p
              v-if="'text' in row"
              class="text-base leading-5 text-primary flex-1"
            >
              {{ row.text }}
            </p>
          </li>
        </ul>
      </div>
    </div>

    <div class="shrink-0 flex flex-col gap-4 px-4 pt-4 pb-6">
      <button
        type="button"
        class="appearance-none outline-none! h-13 w-full flex items-center justify-center rounded-[20px] text-base font-bold text-white active:scale-[1.02] select-none transition-transform"
        style="background: linear-gradient(158deg, #FF6E00 0%, #FF003B 100%)"
        @click="navigateTo('/scan')"
      >
        Scan QR code
      </button>
      <p class="text-caption leading-4 text-secondary text-center">
        ✨ Bonus: Redeeming prizes will NOT impact your final leaderboard score.
      </p>
    </div>
  </div>
</template>
