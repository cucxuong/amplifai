/** Conference agenda window (inclusive) */
export const AGENDA_SCHEDULE_START = '2026-06-02'
export const AGENDA_SCHEDULE_END = '2026-06-05'

export interface AgendaItem {
  id: string
  /** ISO 8601 local datetime; same calendar day as `endAt`; 1–2h before `endAt` */
  startAt: string
  endAt: string
  title: string
  speaker: string
  speakerImage: string
  sparks: number
  stage?: string
  /** Always-on booth tab; still single-day `startAt` / `endAt` */
  alwaysOn?: boolean
  inMySchedule?: boolean
}

export function isAlwaysOnItem(item: AgendaItem) {
  return item.alwaysOn === true
}

export function isAgendaItemLive(item: AgendaItem, now = new Date()) {
  const start = new Date(item.startAt).getTime()
  const end = new Date(item.endAt).getTime()
  const t = now.getTime()
  return t >= start && t < end
}

export function itemOnDate(item: AgendaItem, date: string) {
  return item.startAt.slice(0, 10) === date
}

export const useAgendaStore = defineStore('agenda', () => {
  const items = ref<AgendaItem[]>([
    // Tue 2026-06-02 (5)
    {
      id: 'agenda-tue-open',
      startAt: '2026-06-02T09:00:00',
      endAt: '2026-06-02T10:00:00',
      title: 'Opening Keynote',
      speaker: 'Host',
      speakerImage: '/speaker-4.jpg',
      sparks: 10,
      inMySchedule: true,
    },
    {
      id: 'agenda-tue-trends',
      startAt: '2026-06-02T10:30:00',
      endAt: '2026-06-02T12:00:00',
      title: '2026 Beauty Trends',
      speaker: 'Sarah Chen',
      speakerImage: '/speaker-1.jpg',
      sparks: 15,
      stage: 'Stage A',
    },
    {
      id: 'agenda-tue-sustain',
      startAt: '2026-06-02T12:30:00',
      endAt: '2026-06-02T13:30:00',
      title: 'Sustainable Formulation',
      speaker: 'Marcus Lee',
      speakerImage: '/speaker-2.jpg',
      sparks: 12,
      inMySchedule: true,
    },
    {
      id: 'agenda-tue-retail',
      startAt: '2026-06-02T14:00:00',
      endAt: '2026-06-02T16:00:00',
      title: 'Retail Tech Showcase',
      speaker: 'Nina Patel',
      speakerImage: '/speaker-3.jpg',
      sparks: 18,
      stage: 'Stage B',
    },
    {
      id: 'agenda-tue-network',
      startAt: '2026-06-02T16:30:00',
      endAt: '2026-06-02T17:30:00',
      title: 'Founder Networking Hour',
      speaker: 'Community',
      speakerImage: '/speaker-4.jpg',
      sparks: 8,
    },
    // Wed 2026-06-03 (5)
    {
      id: 'agenda-wed-ai-live',
      startAt: '2026-06-03T09:00:00',
      endAt: '2026-06-03T10:00:00',
      title: 'AI Innovation in Beauty',
      speaker: 'Laurence Liew',
      speakerImage: '/speaker-1.jpg',
      sparks: 20,
      stage: 'Stage A',
      inMySchedule: true,
    },
    {
      id: 'agenda-wed-roi-1',
      startAt: '2026-06-03T10:30:00',
      endAt: '2026-06-03T12:30:00',
      title: 'Beyond the Hype: AI ROI',
      speaker: 'Andy Brown',
      speakerImage: '/speaker-2.jpg',
      sparks: 20,
      inMySchedule: false,
    },
    {
      id: 'agenda-wed-roi-2',
      startAt: '2026-06-03T13:00:00',
      endAt: '2026-06-03T14:00:00',
      title: 'Measuring AI Impact',
      speaker: 'Andy Brown',
      speakerImage: '/speaker-3.jpg',
      sparks: 20,
      inMySchedule: true,
    },
    {
      id: 'agenda-wed-personal',
      startAt: '2026-06-03T14:30:00',
      endAt: '2026-06-03T16:00:00',
      title: 'Personalization at Scale',
      speaker: 'Elena Rossi',
      speakerImage: '/speaker-4.jpg',
      sparks: 16,
      stage: 'Stage B',
    },
    {
      id: 'agenda-wed-lab',
      startAt: '2026-06-03T16:30:00',
      endAt: '2026-06-03T18:00:00',
      title: 'Ingredient Discovery Lab',
      speaker: 'Dr. Kim',
      speakerImage: '/speaker-1.jpg',
      sparks: 22,
      inMySchedule: true,
    },
    // Thu 2026-06-04 (5)
    {
      id: 'agenda-thu-brand',
      startAt: '2026-06-04T09:00:00',
      endAt: '2026-06-04T10:00:00',
      title: 'Brand Storytelling Masterclass',
      speaker: 'Jordan Blake',
      speakerImage: '/speaker-2.jpg',
      sparks: 14,
    },
    {
      id: 'agenda-thu-data',
      startAt: '2026-06-04T10:30:00',
      endAt: '2026-06-04T12:00:00',
      title: 'Consumer Data Deep Dive',
      speaker: 'Priya Shah',
      speakerImage: '/speaker-3.jpg',
      sparks: 17,
      inMySchedule: true,
    },
    {
      id: 'agenda-thu-panel',
      startAt: '2026-06-04T13:00:00',
      endAt: '2026-06-04T15:00:00',
      title: 'Data & Beauty Panel',
      speaker: 'Panel',
      speakerImage: '/speaker-1.jpg',
      sparks: 15,
    },
    {
      id: 'agenda-thu-workshop',
      startAt: '2026-06-04T15:30:00',
      endAt: '2026-06-04T17:30:00',
      title: 'Hands-on Lab',
      speaker: 'Facilitator',
      speakerImage: '/speaker-4.jpg',
      sparks: 25,
      inMySchedule: true,
    },
    {
      id: 'agenda-thu-social',
      startAt: '2026-06-04T18:00:00',
      endAt: '2026-06-04T19:00:00',
      title: 'Social Commerce Playbook',
      speaker: 'Mia Torres',
      speakerImage: '/speaker-2.jpg',
      sparks: 11,
    },
    // Fri 2026-06-05 (5)
    {
      id: 'agenda-fri-future',
      startAt: '2026-06-05T09:00:00',
      endAt: '2026-06-05T11:00:00',
      title: 'Future of Beauty Tech',
      speaker: 'Laurence Liew',
      speakerImage: '/speaker-1.jpg',
      sparks: 20,
      stage: 'Stage A',
    },
    {
      id: 'agenda-fri-partner',
      startAt: '2026-06-05T11:30:00',
      endAt: '2026-06-05T12:30:00',
      title: 'Partner Ecosystem Briefing',
      speaker: 'Andy Brown',
      speakerImage: '/speaker-2.jpg',
      sparks: 12,
      inMySchedule: true,
    },
    {
      id: 'agenda-fri-pitch',
      startAt: '2026-06-05T13:00:00',
      endAt: '2026-06-05T14:30:00',
      title: 'Startup Pitch Finals',
      speaker: 'Judges',
      speakerImage: '/speaker-3.jpg',
      sparks: 18,
    },
    {
      id: 'agenda-fri-roadmap',
      startAt: '2026-06-05T14:30:00',
      endAt: '2026-06-05T15:30:00',
      title: 'Product Roadmap Preview',
      speaker: 'Product Team',
      speakerImage: '/speaker-4.jpg',
      sparks: 15,
      inMySchedule: true,
    },
    {
      id: 'agenda-fri-closing',
      startAt: '2026-06-05T16:00:00',
      endAt: '2026-06-05T18:00:00',
      title: 'Closing & Awards',
      speaker: 'Host',
      speakerImage: '/speaker-1.jpg',
      sparks: 10,
    },
    // Always-on booth tab
    {
      id: 'agenda-booth-demo',
      startAt: '2026-06-02T09:00:00',
      endAt: '2026-06-02T11:00:00',
      title: 'Tech Demo Corner',
      speaker: 'Booth team',
      speakerImage: '/speaker-4.jpg',
      sparks: 5,
      alwaysOn: true,
    },
  ])

  function itemsByDate(date: string | null) {
    if (date === null)
      return items.value.filter(isAlwaysOnItem)
    return items.value.filter(i => !isAlwaysOnItem(i) && itemOnDate(i, date))
  }

  const scheduledItems = computed(() =>
    items.value.filter(i => i.inMySchedule),
  )

  function itemsForView(tab: 'all' | 'my-schedule', date: string | null) {
    const byDate = itemsByDate(date)
    if (tab === 'all')
      return byDate
    return byDate.filter(i => i.inMySchedule)
  }

  return {
    items,
    itemsByDate,
    scheduledItems,
    itemsForView,
    isAgendaItemLive,
    isAlwaysOnItem,
    itemOnDate,
  }
})
