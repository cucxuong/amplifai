<script setup lang="ts">
// no logic needed for now
</script>

<template>
  <div class="h-dvh flex flex-col justify-between overflow-hidden text-white">
    <!-- BACKGROUND -->
    <div class="absolute inset-0 -z-10">
      <!-- base gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0a1a4f] to-[#1e3a8a]"
      />

      <!-- light streak -->
      <div
        class="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_20%,rgba(56,189,248,0.4),transparent_40%)]"
      />
    </div>

    <!-- HERO (CENTER) -->
    <div class="flex-1 flex items-center justify-center absolute">
      <div
        class="relative flex items-center justify-center translate-x-[60%] translate-y-2"
      >
        <!-- OUTER GLOW -->
        <div
          class="absolute rounded-full"
          style="
            width: 520px;
            height: 520px;
            background: radial-gradient(
              circle,
              rgba(59, 130, 246, 0.4),
              transparent 70%
            );
          "
        />

        <!-- BIG DARK CIRCLE -->
        <div
          class="absolute rounded-full"
          style="
            width: 420px;
            height: 420px;
            background: radial-gradient(
              circle at center,
              #020617 0%,
              #020617 40%,
              rgba(2, 6, 23, 0.6) 70%,
              transparent 100%
            );
          "
        />

        <!-- MID CIRCLE -->
        <div
          class="absolute rounded-full"
          style="
            width: 300px;
            height: 300px;
            box-shadow: inset 0 20px 40px rgba(59, 130, 246, 0.25);
            background: radial-gradient(
              circle,
              rgba(30, 64, 175, 0.5),
              transparent 80%
            );
          "
        />

        <!-- INNER CIRCLE -->
        <div
          class="absolute rounded-full"
          style="
            width: 200px;
            height: 200px;
            box-shadow: inset 0 10px 30px rgba(96, 165, 250, 0.3);
            background: radial-gradient(
              circle,
              rgba(59, 130, 246, 0.6),
              transparent 85%
            );
          "
        />

        <!-- GIFT -->
        <img
          src="/gift.png"
          class="relative z-10 w-[200px] h-[200px] object-contain drop-shadow-[0_0_25px_rgba(96,165,250,0.6)] animate-float"
        />
      </div>
    </div>

    <!-- CONTENT -->
    <div
      class="px-6 pb-6 space-y-6 mt-[calc(35dvh-92px)] z-2 grid grid-rows-[auto_1fr_auto] h-[65dvh]"
    >
      <!-- TITLE -->
      <div class="text-center space-y-2">
        <h1 class="text-[2rem] font-semibold tracking-wide">
          UNLOCK YOUR AI <br />
          REWARDS 🚀
        </h1>
        <p class="text-white/70 text-[16px] mb-6">
          Turn your points into exclusive prizes!
        </p>
      </div>

      <!-- FEATURES -->
      <div class="text-sm text-white/80">
        <div class="grid grid-cols-[auto_1fr] gap-3 mt-5">
          <NuxtImg src="/gift-record.svg" class="size-6 object-cover w-fit" />
          <p class="text-[16px]">
            Every reward comes with its own point value — choose wisely 👀
          </p>
        </div>

        <div class="grid grid-cols-[auto_1fr] gap-3 mt-5">
          <NuxtImg src="/scan.svg" class="size-6 object-cover w-fit" />
          <p class="text-[16px]">
            Visit the redemption booth at <b>Level 47</b> and scan the QR code
            on the tablet to claim your prize.
          </p>
        </div>

        <div class="grid grid-cols-[auto_1fr] gap-3 mt-5">
          <NuxtImg src="/star-gift.svg" class="size-6 object-cover w-fit" />
          <p class="text-[16px]">
            Keep earning points throughout the experience to unlock even more
            rewards!
          </p>
        </div>
      </div>

      <!-- BUTTON -->
      <button
        class="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 active:scale-95 transition"
      >
        Scan QR code
      </button>

      <!-- FOOTNOTE -->
      <p class="text-center text-xs text-white/50">
        ✨ Bonus: Redeeming prizes will NOT impact your final leaderboard score.
      </p>
    </div>
  </div>
</template>
