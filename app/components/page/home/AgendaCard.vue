<script setup lang="ts">
const props = defineProps<{
  agenda: AgendaItem
  live?: boolean
}>()
const isLive = computed(() => isAgendaItemLive(props.agenda) || props.live)
</script>
<template>
  <div
    class="col-span-full grid grid-cols-subgrid p-2.5 pr-3 rounded-[20px]"
    :class="isLive ? 'bg-[#050A30] text-primary border border-[#FF6E00] shadow-[0_6px_4px_0_rgba(0_0_0/0.0),0_4px_20px_0_rgb(0_87_255/0.5)inset,0_-4px_20px_0_rgb(255_110_0/0.2)_inset]' : 'bg-primary text-surface'"
  >
    <div class="size-14 aspect-square rounded-xl overflow-hidden outline-2 outline-primary/10">
      <NuxtImg
        :src="props.agenda.speakerImage"
        class="size-full object-cover object-center"
      />
    </div>
    <div class="flex flex-col justify-between">
      <div class="flex items-center gap-1 font-bold">
        <span class="text-[11px] leading-[14px] tracking-[0.22px]">{{ useDateFormat(props.agenda.startAt, 'HH:mm') }}</span>
        <span
          v-if="isLive"
          class="text-caption font-bold p-0.5 px-2 rounded-full bg-[linear-gradient(135deg,#FF6E00,#FF003B)] text-primary inline-flex items-center gap-1"
        >
          <Icon
            name="amplif:dot" 
            :size="6" 
          />
          Live
        </span>
      </div>
      <span class="text-label">{{ props.agenda.title }}</span>
      <span class="text-caption">{{ props.agenda.speaker }}</span>
    </div>
    <div class="flex flex-col items-center gap-1 my-auto">
      <div
        class="flex items-center"
        style="background: linear-gradient(135deg, var(--Radiant-Orange-5, #FF6E00) 0%, var(--Red-5, #FF003B) 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;"
      >
        <span class="font-bold">+{{ props.agenda.sparks }}</span>
        <NuxtImg
          src="/ai-colored.svg"
          class="size-4"
        />
      </div>
      <span class="text-caption leading-[14px]">Sparks</span>
    </div>
  </div>
</template>
