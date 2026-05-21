<script setup lang="ts">
const activeAgendaTab = ref<'all' | 'my-schedule'>('all')

const AGENDA_DAYS = [
  { day: 'TUE', date: '2026-06-02' },
  { day: 'WED', date: '2026-06-03' },
  { day: 'THU', date: '2026-06-04' },
  { day: 'FRI', date: '2026-06-05' },
  { day: 'ALWAYS ON BOOTH', date: null },
] as const

const activeDate = ref<string>(AGENDA_DAYS[0].day)

const agendaStore = useAgendaStore()
const { agendaItemsForView } = useAgendaSchedule()

const agendaItems = computed(() => {
  const date = activeDate.value === 'ALWAYS ON BOOTH' ? null : AGENDA_DAYS.find(day => day.day === activeDate.value)?.date
  return agendaItemsForView(activeAgendaTab.value, date ?? null) ?? []
})

const isLoading = computed(() => agendaStore.loading && !agendaStore.fetched)
const showEmpty = computed(() => agendaStore.fetched && !agendaStore.error && agendaItems.value.length === 0)
</script>

<template>
  <PageHomeContainer>
    <AppMinisiteUnavailableBanner class="mt-2" />
    <PageHomeWidgets show-activities />

    <div class="flex flex-col gap-4 p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-title capitalize">
          Agenda
        </h2>

        <GlassPanel
          class="p-0.75 inline-grid grid-cols-2 items-center gap-0.5 rounded-[14px]"
          style="background: linear-gradient(0deg, rgb(5 10 48 / 0.4), rgb(5 10 48 / 0.4)), rgb(255 255 255 / 0.1);"
        >
          <div
            class="rounded-[12px] p-2.5 px-4 grid place-content-center before:border-0"
            :class="activeAgendaTab === 'all' ? 'glass-panel bg-primary text-surface' : ''"
            @click="activeAgendaTab = 'all'"
          >
            <span :class="['text-label', { 'font-normal': activeAgendaTab !== 'all' }]">All events</span>
          </div>
          <div
            class="rounded-[12px] p-2.5 px-4 grid place-content-center before:border-0"
            :class="activeAgendaTab === 'my-schedule' ? 'glass-panel bg-primary text-surface' : ''"
            @click="activeAgendaTab = 'my-schedule'"
          >
            <span :class="['text-label', { 'font-normal': activeAgendaTab !== 'my-schedule' }]">My schedule</span>
          </div>
        </GlassPanel>
      </div>

      <div class="bg-white p-4 py-5 rounded-[28px] gap-7 flex flex-col">
        <div class="flex *:flex-1 gap-2.5 overflow-x-auto">
          <button
            v-for="day in AGENDA_DAYS"
            :key="day.day"
            class="flex flex-col items-center justify-center text-center gap-1 p-2 rounded-xl font-bold uppercase"
            :class="[
              day.date ? 'aspect-square size-13' : 'h-13 px-2.5',
              activeDate === day.day ? 'bg-[linear-gradient(135deg,#FF6E00,#FF003B)] *:text-primary' : 'bg-muted text-surface',
              { 'invisible pointer-events-none': activeAgendaTab === 'my-schedule' && !day.date },
            ]"
            :inert="activeAgendaTab === 'my-schedule' && !day.date"
            @click="activeDate = day.day"
          >
            <span
              v-if="day.date"
              class="text-[11px] leading-[14px] tracking-[0.22px] text-subtle"
            >{{ day.day }}</span>
            <span
              v-else
              class="text-[11px] leading-[14px] tracking-[0.22px] min-w-max"
            >ALWAYS <br> ON BOOTH</span>
            <span v-if="day.date">{{ new Date(day.date).getDate() }}</span>
          </button>
        </div>

        <div
          v-if="isLoading"
          class="py-10 text-center text-secondary text-label"
        >
          Loading agenda…
        </div>

        <div
          v-else-if="agendaStore.error"
          class="py-8 flex flex-col items-center gap-3"
        >
          <p class="text-caption text-secondary text-center">
            {{ agendaStore.error }}
          </p>
          <button
            type="button"
            class="text-label font-bold text-primary underline"
            @click="agendaStore.fetchSessions(true)"
          >
            Retry
          </button>
        </div>

        <div
          v-else-if="agendaItems.length > 0"
          class="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3"
        >
          <PageHomeAgendaCard
            v-for="(agenda, index) in agendaItems"
            :key="agenda.id"
            :agenda="agenda"
            :live="index === 0"
          />
        </div>

        <PageHomeAgendaEmpty v-else-if="showEmpty" />
      </div>
    </div>
  </PageHomeContainer>
</template>
