import type { StoredUser } from '../auth/users.store'

export function buildUserSessionPayload(user: StoredUser) {
  return {
    user: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
    },
    onboardingComplete: user.onboardingComplete,
    personaId: user.personaId,
    loggedInAt: Date.now(),
  }
}
