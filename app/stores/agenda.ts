import { mapSessionToAgendaItem } from '~/utils/api/mappers/minisite'

/** Conference agenda window (inclusive) */
export const AGENDA_SCHEDULE_START = '2026-06-02'
export const AGENDA_SCHEDULE_END = '2026-06-05'

export interface AgendaItem {
  id: string
  /** ISO 8601 local datetime; same calendar day as `endAt`; 1–2h before `endAt` */
  startAt: string
  endAt: string
  title: string
  description?: string
  speaker: string
  speakerTitle?: string
  speakerOrg?: string
  speakerImage: string
  sparks: number
  stage?: string
  location?: string
  locationDetail?: string
  /** Always-on booth tab; still single-day `startAt` / `endAt` */
  alwaysOn?: boolean
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
  const items = ref<AgendaItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetched = ref(false)

  async function fetchSessions(force = false) {
    if (fetched.value && !force)
      return
    loading.value = true
    error.value = null
    try {
      const api = useApi()
      // Real API returns unwrapped array via server route proxy
      const sessions = await api.get<import('#shared/types/minisite').MinisiteSession[]>('/api/minisite/sessions')

      if (!Array.isArray(sessions)) {
        throw new Error(`Expected array of sessions, got ${typeof sessions}`)
      }

      items.value = sessions.map(mapSessionToAgendaItem)
      fetched.value = true
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load agenda'
    }
    finally {
      loading.value = false
    }
  }

  function itemsByDate(date: string | null) {
    if (date === null)
      return items.value.filter(isAlwaysOnItem)
    return items.value.filter(i => !isAlwaysOnItem(i) && itemOnDate(i, date))
  }

  function reset() {
    items.value = []
    fetched.value = false
    loading.value = false
    error.value = null
  }

  return {
    items,
    loading,
    error,
    fetched,
    fetchSessions,
    reset,
    itemsByDate,
    isAgendaItemLive,
    isAlwaysOnItem,
    itemOnDate,
  }
})
