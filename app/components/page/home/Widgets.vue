<script setup lang="ts">
const props = defineProps<{
  showActivities?: boolean
}>()
</script>

<template>
  <div class="p-4 pb-5 grid grid-cols-2 gap-3">
    <GlassPanel
      class="p-2 py-2.5 flex items-center gap-0.5"
      style="background: linear-gradient(0deg, rgb(5 10 48 / 0.4), rgb(5 10 48 / 0.4)), rgb(255 255 255 / 0.1);"
    >
      <NuxtImg
        src="/star-four.png"
        class="size-9 object-cover"
      />
      <div class="flex flex-col gap-1.5 flex-1">
        <span class="text-[11px] leading-[14px] text-secondary uppercase">SPARK SCORE</span>
        <span><span class="text-[24px] leading-[28px] font-bold">180</span><span class="leading-[28px] text-secondary">/240</span></span>
      </div>
      <GlassPanel class="appearance-none outline-none! size-7 rounded-4xl p-0 [--light-deg:-45deg] bg-primary/20 grid place-content-center active:scale-110 select-none mb-auto">
        <Icon
          name="amplif:arrow-up-right"
          :size="12"
        />
      </GlassPanel>
    </GlassPanel>

    <GlassPanel
      class="p-2 py-2.5 flex items-center gap-0.5"
      style="background: linear-gradient(0deg, rgb(5 10 48 / 0.4), rgb(5 10 48 / 0.4)), rgb(255 255 255 / 0.1);"
    >
      <NuxtImg
        src="/star.png"
        class="size-9 object-cover"
      />
      <div class="flex flex-col gap-1.5 flex-1">
        <span class="text-[11px] leading-[14px] text-secondary uppercase">RANK</span>
        <span><span class="text-[24px] leading-[28px] font-bold">#14</span></span>
      </div>
      <GlassPanel class="appearance-none outline-none! size-7 rounded-4xl p-0 [--light-deg:-45deg] bg-primary/20 grid place-content-center active:scale-110 select-none mb-auto">
        <Icon
          name="amplif:arrow-up-right"
          :size="12"
        />
      </GlassPanel>
    </GlassPanel>

    <GlassPanel
      v-if="props.showActivities"
      class="col-span-full p-2.5 pt-3 flex items-center gap-3"
      style="background: linear-gradient(0deg, rgb(5 10 48 / 0.4), rgb(5 10 48 / 0.4)), rgb(255 255 255 / 0.1);"
    >
      <div class="size-12 aspect-square rounded-full overflow-hidden glass-panel grid place-content-center bg-primary/20">
        <NuxtImg
          src="/Lightning.png"
          class="size-9 object-cover"
        />
      </div>
      <div class="flex flex-col gap-1.5 flex-1">
        <div class="flex items-center gap-1">
          <Icon
            name="amplif:live-dot"
            :size="16"
          />
          <span class="text-[11px] leading-[14px] tracking-[0.22px] text-tertiary uppercase">Live now</span>
        </div>
        <span><span class="font-bold">AI Innovation in Beauty</span></span>
        <span class="text-caption leading-[14px] text-secondary">Stage A · ends 11:00</span>
      </div>
      <button class="flex justify-center items-center outline-none! p-2 px-3 gap-1 rounded-4xl text-caption font-bold leading-[20px] active:scale-[1.015] select-none transition-all bg-[linear-gradient(135deg,#FF6E00,#FF003B)]">
        Join
        <Icon
          name="amplif:arrow-right"
          :size="12"
        />
      </button>
    </GlassPanel>
  </div>
</template>
