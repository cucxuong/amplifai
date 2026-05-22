<script setup lang="ts">
import { PERSONAS } from '~~/shared/utils/personas'

const { user, session } = useUserSession()
const userStore = useUserStore()

const notificationsEnabled = useState('profileNotificationsEnabled', () => true)

const personaId = computed(() => userStore.profile?.personaId ?? session.value?.personaId)

const personaImg = computed(() => {
  const persona = PERSONAS.find(p => p.id === personaId.value)
  return persona?.image
})
</script>

<template>
  <PageHomeContainer class="gap-8">
    <div class="flex flex-col items-center gap-6 px-4 text-center">
      <div class="size-[90px] rounded-full overflow-hidden bg-[#000D42]/10 outline-6 outline-primary/10 grid place-content-center shrink-0">
        <NuxtImg
          v-if="personaImg"
          :src="personaImg"
          alt=""
          class="size-[90px] object-cover object-center"
        />
        <Icon
          v-else
          name="amplif:profile"
          :size="36"
        />
      </div>

      <div class="flex flex-col w-full">
        <h2 class="text-[24px] leading-8 font-bold capitalize text-primary">
          {{ user?.name }}
        </h2>
        <p class="text-caption leading-[18px] text-secondary">
          {{ user?.email }}
        </p>
      </div>
    </div>

    <div class="flex flex-col gap-6 w-full">
      <PageHomeWidgets />

      <div
        class="mx-4 rounded-[28px] overflow-hidden px-5"
        style="background: linear-gradient(90deg, rgb(0 33 165 / 0.3), rgb(0 33 165 / 0.3)), linear-gradient(90deg, rgb(0 0 0 / 0.2), rgb(0 0 0 / 0.2));"
      >
        <NuxtLink
          to="/sparks"
          class="flex items-center gap-6 py-5 border-b border-white/20 text-primary active:opacity-80"
        >
          <span class="flex-1 font-bold text-base leading-5">
            Sparks Balance
          </span>
          <Icon
            name="amplif:arrow-right"
            :size="24"
            class="shrink-0"
          />
        </NuxtLink>

        <div class="flex items-center gap-6 py-5">
          <span class="flex-1 font-bold text-base leading-5 text-primary">
            Notifications
          </span>

          <button
            type="button"
            role="switch"
            class="relative h-6 w-10 shrink-0 rounded-full transition-colors outline-none!"
            :aria-checked="notificationsEnabled"
            :class="notificationsEnabled
              ? 'bg-[linear-gradient(149deg,#FF6E00,#FF003B)]'
              : 'bg-white/20'"
            @click="notificationsEnabled = !notificationsEnabled"
          >
            <span
              class="absolute top-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.12)] transition-[left]"
              :class="notificationsEnabled ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'"
            />
          </button>
        </div>
      </div>
    </div>
  </PageHomeContainer>
</template>

