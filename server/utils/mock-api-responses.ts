/**
 * Mock API responses for development/testing with mock SSO
 * When user signs in with mock SSO, these responses are used instead
 * of calling the real Minisite backend
 */

import type { StoredUser } from '../services/auth/users.store'

export interface MockUserProfile {
  email: string
  firstName: string
  lastName: string
  sparks: number
  rank: number
  personaId: string | null
  onboardingComplete: boolean
}

export interface MockSession {
  user: MockUserProfile
  onboardingComplete: boolean
  personaId: string | null
}

/**
 * Mock user profiles with test data
 */
export const MOCK_USER_PROFILES: Record<string, MockUserProfile> = {
  'dev.user@loreal.com': {
    email: 'dev.user@loreal.com',
    firstName: 'Dev',
    lastName: 'User',
    sparks: 0,
    rank: 1,
    personaId: null,
    onboardingComplete: false,
  },
  'innovator.test@loreal.com': {
    email: 'innovator.test@loreal.com',
    firstName: 'Isabella',
    lastName: 'Innovator',
    sparks: 450,
    rank: 2,
    personaId: 'innovator',
    onboardingComplete: true,
  },
  'explorer.test@loreal.com': {
    email: 'explorer.test@loreal.com',
    firstName: 'Emily',
    lastName: 'Explorer',
    sparks: 320,
    rank: 3,
    personaId: 'explorer',
    onboardingComplete: true,
  },
  'connector.test@loreal.com': {
    email: 'connector.test@loreal.com',
    firstName: 'Christopher',
    lastName: 'Connector',
    sparks: 280,
    rank: 4,
    personaId: 'connector',
    onboardingComplete: true,
  },
  'performer.test@loreal.com': {
    email: 'performer.test@loreal.com',
    firstName: 'Priya',
    lastName: 'Performer',
    sparks: 520,
    rank: 1,
    personaId: 'performer',
    onboardingComplete: true,
  },
}

/**
 * Get mock user profile
 */
export function getMockUserProfile(email: string): MockUserProfile {
  return (
    MOCK_USER_PROFILES[email] || {
      email,
      firstName: 'Test',
      lastName: 'User',
      sparks: 0,
      rank: 999,
      personaId: null,
      onboardingComplete: false,
    }
  )
}

/**
 * Update mock user profile
 */
export function updateMockUserProfile(email: string, updates: Partial<MockUserProfile>): MockUserProfile {
  const profile = getMockUserProfile(email)
  const updated = { ...profile, ...updates }
  MOCK_USER_PROFILES[email] = updated
  return updated
}

/**
 * Get mock leaderboard
 */
export function getMockLeaderboard(): MockUserProfile[] {
  return Object.values(MOCK_USER_PROFILES).sort((a, b) => b.sparks - a.sparks)
}

/**
 * Get mock sessions/agenda
 */
export function getMockSessions() {
  return [
    {
      id: 'sess-1',
      title: 'Keynote: The Future of AI',
      type: 'keynote',
      day: 1,
      date: '2026-06-02',
      startTime: '09:00',
      endTime: '10:00',
      venue: 'Main Hall',
      speaker: 'Sarah Johnson',
      description: 'Opening keynote on AI trends',
      checkInCount: 245,
    },
    {
      id: 'sess-2',
      title: 'Masterclass: Advanced React',
      type: 'masterclass',
      day: 1,
      date: '2026-06-02',
      startTime: '10:30',
      endTime: '12:00',
      venue: 'Room A',
      speaker: 'Alex Chen',
      description: 'Deep dive into React hooks and patterns',
      checkInCount: 89,
    },
    {
      id: 'sess-3',
      title: 'Panel: Digital Transformation',
      type: 'panel',
      day: 2,
      date: '2026-06-03',
      startTime: '14:00',
      endTime: '15:30',
      venue: 'Main Hall',
      speaker: 'Multiple Speakers',
      description: 'Industry leaders discuss digital transformation',
      checkInCount: 156,
    },
    {
      id: 'sess-4',
      title: 'Workshop: Web3 Basics',
      type: 'workshop',
      day: 2,
      date: '2026-06-03',
      startTime: '10:00',
      endTime: '12:00',
      venue: 'Room B',
      speaker: 'Morgan Lee',
      description: 'Introduction to blockchain and Web3',
      checkInCount: 67,
    },
    {
      id: 'sess-5',
      title: 'Networking Event',
      type: 'networking',
      day: 3,
      date: '2026-06-04',
      startTime: '18:00',
      endTime: '20:00',
      venue: 'Rooftop Terrace',
      speaker: 'Open Networking',
      description: 'Evening networking with refreshments',
      checkInCount: 324,
    },
  ]
}

/**
 * Get mock products for gift shop
 */
export function getMockProducts() {
  return [
    {
      id: 'prod-1',
      name: 'L\'Oréal Exclusive Tote Bag',
      description: 'Premium branded tote bag',
      sparksCost: 150,
      image: '/products/tote-bag.png',
      available: true,
    },
    {
      id: 'prod-2',
      name: 'Smart Water Bottle',
      description: 'Temperature tracking water bottle',
      sparksCost: 250,
      image: '/products/water-bottle.png',
      available: true,
    },
    {
      id: 'prod-3',
      name: 'Wireless Earbuds',
      description: 'Premium noise-cancelling earbuds',
      sparksCost: 500,
      image: '/products/earbuds.png',
      available: true,
    },
    {
      id: 'prod-4',
      name: 'Premium Face Care Set',
      description: 'L\'Oréal skincare collection',
      sparksCost: 200,
      image: '/products/skincare.png',
      available: true,
    },
    {
      id: 'prod-5',
      name: 'Branded Hoodie',
      description: 'Comfortable branded hoodie',
      sparksCost: 300,
      image: '/products/hoodie.png',
      available: true,
    },
  ]
}

/**
 * Get mock admin stats
 */
export function getMockAdminStats() {
  const leaderboard = getMockLeaderboard()
  const sessions = getMockSessions()

  return {
    users: {
      total: leaderboard.length,
      activeToday: Math.ceil(leaderboard.length * 0.6),
    },
    checkIns: {
      total: sessions.reduce((sum, s) => sum + s.checkInCount, 0),
      today: Math.floor(Math.random() * 200) + 50,
    },
    orders: {
      pendingPickup: Math.floor(Math.random() * 15),
      totalRevenueSparks: Math.floor(Math.random() * 5000),
    },
    sparks: {
      circulating: leaderboard.reduce((sum, u) => sum + u.sparks, 0),
    },
    liveSessions: 2,
    topSessions: sessions
      .sort((a, b) => b.checkInCount - a.checkInCount)
      .slice(0, 3),
    sparksByDay: [
      { _id: 'June 2', total: 890, count: 156 },
      { _id: 'June 3', total: 1240, count: 203 },
      { _id: 'June 4', total: 756, count: 134 },
      { _id: 'June 5', total: 504, count: 98 },
    ],
  }
}

/**
 * Simulate QR code redeem
 */
export function simulateQrRedeem(email: string, sessionId: string, campaignId: string, value: number) {
  const profile = getMockUserProfile(email)
  const newBalance = profile.sparks + value
  const updated = updateMockUserProfile(email, { sparks: newBalance })

  return {
    success: true,
    data: {
      sparksAwarded: value,
      newBalance,
      user: updated,
    },
  }
}

/**
 * Simulate order redeem
 */
export function simulateOrderRedeem(email: string, productId: string, sparksCost: number) {
  const profile = getMockUserProfile(email)

  if (profile.sparks < sparksCost) {
    return {
      success: false,
      error: 'Insufficient sparks',
    }
  }

  const newBalance = profile.sparks - sparksCost
  updateMockUserProfile(email, { sparks: newBalance })

  return {
    success: true,
    data: {
      orderId: `order-${Date.now()}`,
      productId,
      sparksCost,
      remainingBalance: newBalance,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  }
}
