import type { MinisiteSession, MinisiteMeResponse, MinisiteLeaderboardEntry, MinisiteSparkTransaction } from '#shared/types/minisite'
import type { AgendaItem } from '~/stores/agenda'

function sessionDateString(session: MinisiteSession): string {
  if (session.date)
    return new Date(session.date).toISOString().slice(0, 10)
  const base = new Date('2026-06-02T00:00:00')
  base.setDate(base.getDate() + (session.day - 1))
  return base.toISOString().slice(0, 10)
}

export function mapSessionToAgendaItem(session: MinisiteSession): AgendaItem {
  const date = sessionDateString(session)
  const speaker = session.speakers?.[0]
  return {
    id: session._id,
    startAt: `${date}T${session.startTime}:00`,
    endAt: `${date}T${session.endTime}:00`,
    title: session.title,
    description: session.description,
    speaker: speaker?.name ?? 'TBA',
    speakerTitle: speaker?.title,
    speakerOrg: speaker?.company,
    speakerImage: speaker?.photoUrl ?? '/speaker-4.jpg',
    sparks: session.sparksReward,
    stage: session.stage,
    location: session.location,
    alwaysOn: session.type === 'booth',
  }
}

export interface LeaderboardRow {
  id: string
  name: string
  img: string
  score: number
  rank: number
  isYou?: boolean
}

export function mapLeaderboardEntry(
  entry: MinisiteLeaderboardEntry,
  currentUserId?: string | null,
): LeaderboardRow {
  const mongoId = entry._id ?? entry.id ?? ''
  const name = entry.displayName?.trim()
    || `${entry.firstName} ${entry.lastName}`.trim()
    || 'Participant'
  return {
    id: mongoId,
    name: mongoId === currentUserId ? 'You' : name,
    img: entry.avatarUrl ?? '/player-3.jpg',
    score: entry.sparks,
    rank: entry.rank,
    isYou: mongoId !== '' && mongoId === currentUserId,
  }
}

export interface SparkActivityRow {
  id: string
  title: string
  date: string
  time: string | null
  sparks: number
}

function formatActivityDate(iso: string): { date: string, time: string | null } {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  let dateLabel = d.toLocaleDateString('en-US', { weekday: 'long' })
  if (sameDay)
    dateLabel = 'Today'
  else if (isYesterday)
    dateLabel = 'Yesterday'

  return {
    date: dateLabel,
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

export function mapSparkTransaction(tx: MinisiteSparkTransaction): SparkActivityRow {
  const { date, time } = formatActivityDate(tx.createdAt)
  return {
    id: tx._id,
    title: tx.description || tx.source,
    date,
    time,
    sparks: tx.amount,
  }
}

export function mapMeProfile(data: MinisiteMeResponse) {
  return {
    userId: data.user._id,
    email: data.user.email,
    name: data.user.displayName?.trim()
      || `${data.user.firstName} ${data.user.lastName}`.trim()
      || data.user.email,
    personaId: data.user.persona ?? null,
    sparks: data.user.sparks,
    rank: data.rank,
    totalParticipants: data.totalParticipants,
    avatarUrl: data.user.avatarUrl ?? null,
    recentActivity: data.recentActivity.map(mapSparkTransaction),
  }
}
