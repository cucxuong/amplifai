<script setup lang="ts">
import { h, type VNode } from 'vue'
import { useGiftPageEnterComplete } from '~/utils/gift-page-enter'

const rowTextClass = 'text-base leading-5 text-primary flex-1'

const infoRows: Array<{ icon: string, render: () => VNode }> = [
  {
    icon: 'amplif:gift',
    render: () => h('p', { class: rowTextClass }, 'Every reward comes with its own point value — choose wisely 👀'),
  },
  {
    icon: 'amplif:scan-bold',
    render: () => h('p', { class: rowTextClass }, [
      'Visit the redemption booth at ',
      h('strong', 'Level 47'),
      ' and scan the QR code on the tablet to claim your prize.',
    ]),
  },
  {
    icon: 'amplif:ai',
    render: () => h('p', { class: rowTextClass }, 'Keep earning points throughout the experience to unlock even more rewards!'),
  },
]

const route = useRoute()
const isGiftPageEnterComplete = useGiftPageEnterComplete()
const isPageReady = ref(false)
const isCopyReady = ref(false)
const isListReady = ref(false)

const PAGE_TRANSITION_MS = 280
const COPY_AFTER_HERO_MS = 520
const LIST_AFTER_COPY_MS = 220

let copyTimer: ReturnType<typeof setTimeout> | undefined
let heroTimer: ReturnType<typeof setTimeout> | undefined
let listTimer: ReturnType<typeof setTimeout> | undefined

const isGiftRoute = () => route.path.startsWith('/gift')

function clearAnimationTimers() {
  if (copyTimer)
    clearTimeout(copyTimer)
  if (heroTimer)
    clearTimeout(heroTimer)
  if (listTimer)
    clearTimeout(listTimer)
  copyTimer = undefined
  heroTimer = undefined
  listTimer = undefined
}

function resetAnimations() {
  clearAnimationTimers()
  isPageReady.value = false
  isCopyReady.value = false
  isListReady.value = false
}

function scheduleAnimations() {
  resetAnimations()
  if (!isGiftRoute())
    return

  heroTimer = setTimeout(() => {
    if (!isGiftRoute())
      return

    isPageReady.value = true
    copyTimer = setTimeout(() => {
      if (!isGiftRoute())
        return

      isCopyReady.value = true
      listTimer = setTimeout(() => {
        if (isGiftRoute())
          isListReady.value = true
      }, LIST_AFTER_COPY_MS)
    }, COPY_AFTER_HERO_MS)
  }, 0)
}

watch(isGiftPageEnterComplete, (complete) => {
  if (complete)
    scheduleAnimations()
})

watch(
  () => route.path,
  (path, previousPath) => {
    if (!path.startsWith('/gift') && previousPath?.startsWith('/gift'))
      resetAnimations()
  },
)

onMounted(() => {
  scheduleAnimations()
})

onActivated(() => {
  if (!isGiftRoute())
    return

  if (isGiftPageEnterComplete.value) {
    scheduleAnimations()
    return
  }

  heroTimer = setTimeout(() => {
    if (isGiftRoute())
      scheduleAnimations()
  }, PAGE_TRANSITION_MS)
})

onDeactivated(() => {
  resetAnimations()
})

onBeforeUnmount(() => {
  resetAnimations()
})
</script>
<template>
  <div
    id="gift-page"
    class="gift-page page-content flex flex-col min-h-[calc(100dvh-var(--app-scroll-bottom)-(var(--app-min-scroll-top)*2))] items-center justify-center gap-6 px-4 py-6"
  >
    <div
      class="gift-hero-orbit relative size-[172px] shrink-0"
      :class="{ 'is-ready': isPageReady }"
    >
      <div
        class="size-[490px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]"
        style="background: linear-gradient(180deg, #0B0F17 0%, rgba(1, 14, 69, 0.00) 97.58%), linear-gradient(180deg, #00061E 0%, #01155C 100%); box-shadow: 0 16px 20px 0 rgba(102, 154, 255, 0.10) inset;"
      />
      <div
        class="size-[344px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[-1]"
        style="background: linear-gradient(180deg, #0B0F17 0%, rgba(1, 14, 69, 0.00) 97.58%); box-shadow: 0 16px 20px 0 rgba(102, 154, 255, 0.16) inset;"
      />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[172px] rounded-full glass-panel bg-primary/10 grid place-content-center overflow-hidden">
        <NuxtImg
          src="/gift-box.png"
          class="size-[184px] object-contain"
        />
      </div>
    </div>

    <div class="flex flex-col gap-12 w-full max-w-[358px]">
      <div
        class="gift-copy flex flex-col gap-1 text-center"
        :class="{ 'is-ready': isCopyReady }"
      >
        <h1 class="text-[32px] leading-9 font-bold text-primary">
          UNLOCK YOUR AI REWARDS 🚀
        </h1>
        <p class="text-base leading-5 text-tertiary">
          Turn your points into exclusive prizes!
        </p>
      </div>

      <ul
        class="gift-info-list flex flex-col gap-5 px-4"
        :class="{ 'is-ready': isListReady }"
      >
        <li
          v-for="(row, index) in infoRows"
          :key="index"
          class="gift-info-list__item flex gap-3 items-start"
        >
          <Icon
            :name="row.icon"
            :size="28"
            class="shrink-0"
          />
          <component :is="row.render()" />        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.gift-hero-orbit > * {
  scale: 0;
  transition: scale 400ms cubic-bezier(0.32, 0.72, 0, 1);
  transition-delay: calc((sibling-index() - 1) * 80ms);
}

.gift-hero-orbit.is-ready > * {
  scale: 1;
}

.gift-copy {
  opacity: 0;
  scale: 0.92;
  transform-origin: center top;
  transition:
    opacity 450ms cubic-bezier(0.32, 0.72, 0, 1),
    scale 450ms cubic-bezier(0.32, 0.72, 0, 1);
}

.gift-copy.is-ready {
  opacity: 1;
  scale: 1;
}

.gift-info-list__item {
  opacity: 0;
  translate: 1rem 0;
  transition:
    opacity 400ms cubic-bezier(0.32, 0.72, 0, 1),
    translate 400ms cubic-bezier(0.32, 0.72, 0, 1);
  transition-delay: calc((sibling-index() - 1) * 100ms);
}

.gift-info-list.is-ready > .gift-info-list__item {
  opacity: 1;
  translate: 0 0;
}
</style>
