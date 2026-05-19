<script setup lang="ts">
import { PERSONAS } from '~~/shared/utils/personas'

const { user, clear, session } = useUserSession()

const personaImg = computed(() => {
  const persona = PERSONAS.find(p => p.id === session.value?.personaId)
  return persona?.image
})

async function signOut() {
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <div
    id="home-page"
    class="h-dvh grid grid-rows-[auto_minmax(0,1fr)_auto]"
  >
    <AppTopBar class="p-5 py-6 flex items-center justify-between gap-4 h-auto">
      <div class="flex flex-col">
        <h2 class="text-title capitalize">
          Hi, {{ user.name }}
        </h2>
        <div class="text-caption leading-[18px] text-secondary uppercase">
          {{ new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).replace(/,/g, ' · ') }}
        </div>
      </div>
      <div
        class="rounded-full aspect-square size-12.5 overflow-hidden bg-[#000D42]/10 outline-6 outline-primary/10"
        @click="signOut"
      >
        <NuxtImg
          :src="personaImg"
          class="rounded-full size-full object-cover object-center"
        />
      </div>
    </AppTopBar>
    <main class="flex flex-col overflow-y-auto">
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
      <div class="pb-22.5"/>
    </main>
    <AppBottomBar class="fixed bottom-0 inset-x-0 p-5 py-4">
      <GlassPanel
        class="h-15.5 p-1 rounded-full grid grid-cols-4 grid-rows-1"
        :style="{ background: 'linear-gradient(0deg, rgba(5, 10, 48, 0.4), rgba(5, 10, 48, 0.4)), rgba(255, 255, 255, 0.2)' }"
      >
        <div
          class="glass-panel flex flex-col items-center justify-center gap-1 rounded-full p-2 pb-1.5 capitalize text-caption leading-[14px] font-bold"
          style="background: linear-gradient(0deg, rgba(5, 10, 48, 0.90) 0%, rgba(5, 10, 48, 0.90) 100%), rgba(255, 255, 255, 0.50);"
        >
          <Icon
            name="amplif:calendar-2"
            :size="24"
          />
          <span>Agenda</span>
        </div>
        <div
          class="flex flex-col items-center justify-center gap-1 rounded-full p-2 pb-1.5 capitalize text-caption leading-[14px] font-bold"
        >
          <Icon
            name="amplif:gift"
            :size="24"
          />
          <span>Gift</span>
        </div>
        <div
          class="flex flex-col items-center justify-center gap-1 rounded-full p-2 pb-1.5 capitalize text-caption leading-[14px] font-bold"
        >
          <Icon
            name="amplif:scan-bold"
            :size="24"
          />
          <span>Scan</span>
        </div>
        <div
          class="flex flex-col items-center justify-center gap-1 rounded-full p-2 pb-1.5 capitalize text-caption leading-[14px] font-bold"
        >
          <Icon
            name="amplif:profile"
            :size="24"
          />
          <span>Me</span>
        </div>
      </GlassPanel>
    </AppBottomBar>
  </div>
</template>
