import type { StoredUser } from '../auth/users.store'

interface MinisiteAuthResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      email: string
    }
  }
  error?: string
}

async function getMinisiteToken(user: StoredUser): Promise<string | undefined> {
  const config = useRuntimeConfig()
  const minisiteBase = (config.minisiteApiBase as string).replace(/\/$/, '')
  const devPassword = 'test-password-123'

  try {
    const [loginResponse, registerResponse] = await Promise.all([
      $fetch<MinisiteAuthResponse>(`${minisiteBase}/api/auth/login`, {
        method: 'POST',
        body: { email: user.email, password: devPassword },
      }).catch(() => null),
      $fetch<MinisiteAuthResponse>(`${minisiteBase}/api/auth/register`, {
        method: 'POST',
        body: { email: user.email, firstName: user.firstName, lastName: user.lastName, password: devPassword },
      }).catch(() => null),
    ])

    if (loginResponse?.success && loginResponse.data?.token)
      return loginResponse.data.token

    if (registerResponse?.success && registerResponse.data?.token)
      return registerResponse.data.token
  }
  catch (error) {
    console.error('Failed to get minisite token:', error)
  }

  return undefined
}

export async function buildUserSessionPayload(user: StoredUser) {
  const minisiteToken = await getMinisiteToken(user)

  return {
    user: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim() || user.email,
    },
    onboardingComplete: user.onboardingComplete,
    personaId: user.personaId,
    loggedInAt: Date.now(),
    ...(minisiteToken ? { minisiteToken } : {}),
  }
}
