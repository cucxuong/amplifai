import type { StoredUser } from '../auth/users.store'
import { generateMockToken } from '../auth/token.service'

export function buildUserSessionPayload(user: StoredUser) {
  return {
    user: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
    },
    onboardingComplete: user.onboardingComplete,
    personaId: user.personaId,
    loggedInAt: Date.now(),
    // Add a mock token that simulates the Minisite backend token
    minisiteToken: generateMockToken(user.email),
  }
}
