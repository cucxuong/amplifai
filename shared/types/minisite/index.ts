export interface MinisiteApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
}

export interface MinisitePaginatedEnvelope<T> extends MinisiteApiEnvelope<T[]> {
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface MinisiteSpeaker {
  name: string
  title?: string
  company?: string
  photoUrl?: string
}

export interface MinisiteSession {
  _id: string
  title: string
  description?: string
  type: string
  day: number
  date: string
  startTime: string
  endTime: string
  stage?: string
  location?: string
  speakers?: MinisiteSpeaker[]
  sparksReward: number
  isLive?: boolean
  isPublished?: boolean
}

export interface MinisiteUser {
  _id: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  persona?: string | null
  sparks: number
  avatarUrl?: string | null
  role?: string
}

export interface MinisiteSparkTransaction {
  _id: string
  amount: number
  source: string
  description?: string
  createdAt: string
}

export interface MinisiteMeResponse {
  user: MinisiteUser
  rank: number
  totalParticipants: number
  recentActivity: MinisiteSparkTransaction[]
}

export interface MinisiteLeaderboardEntry {
  rank: number
  /** Authenticated leaderboard uses Mongo `_id`; public leaderboard uses string `id`. */
  _id?: string
  id?: string
  firstName: string
  lastName: string
  displayName?: string
  avatarUrl?: string | null
  sparks: number
  persona?: string | null
}

export interface MinisiteLeaderboardResponse {
  leaderboard: MinisiteLeaderboardEntry[]
  /** Omitted by public leaderboard. */
  myRank?: number | null
  total: number
}

export interface MinisiteProduct {
  _id: string
  name: string
  description?: string
  category: string
  price: number
  /** Minisite field name */
  photoUrl?: string | null
  icon?: string
  physical?: boolean
  stock?: number | null
  imageUrl?: string
  isAvailable?: boolean
}

export interface MinisiteOrderItem {
  productId: string
  productName: string
  qty: number
  unitPrice: number
  isRedeemed?: boolean
}

export interface MinisiteOrder {
  _id: string
  shortId: string
  items: MinisiteOrderItem[]
  totalSparks: number
  status: string
  createdAt?: string
}

export interface MinisiteCheckInResult {
  sparksAwarded: number
  sessionTitle: string
  checkInId: string
}

export interface MinisiteQrRedeemResult {
  title: string
  category: string
  amount: number
  currentSparks: number
}
