import type { H3Event } from 'h3'
import type { MinisiteBridgeData } from '#shared/types/minisite'
import { minisiteFetch } from '../../utils/minisite-client'
import { findUserByEmail, updateUser, type StoredUser } from '../auth/users.store'

function logBridgeFailure(email: string, error: unknown) {
  if (!import.meta.dev)
    return
  const err = error as { statusCode?: number, message?: string, data?: { error?: string } }
  console.error('[minisite-bridge] SSO bridge failed:', {
    email,
    status: err.statusCode,
    message: err.data?.error ?? err.message ?? String(error),
  })
}

export async function bridgeMinisiteUser(
  user: StoredUser,
): Promise<MinisiteBridgeData | undefined> {
  const config = useRuntimeConfig()
  if (!config.minisiteApiBase)
    return undefined

  try {
    const data = await minisiteFetch<MinisiteBridgeData>('auth/sso-bridge', {
      method: 'POST',
      internalKey: config.minisiteInternalKey || undefined,
      body: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        externalId: user.ssoSubjectId ?? user.email,
        persona: user.personaId || undefined,
      },
    })

    if (data.user.persona && !user.personaId) {
      await updateUser(user.email, {
        personaId: data.user.persona,
        onboardingComplete: true,
      })
    }

    return data
  }
  catch (error) {
    logBridgeFailure(user.email, error)
    return undefined
  }
}

/** Re-run SSO bridge for an existing amplifai session missing minisiteToken. */
export async function tryRebridgeMinisiteSession(
  event: H3Event,
  session: Awaited<ReturnType<typeof requireUserSession>>,
): Promise<string | undefined> {
  const email = session.user?.email
  if (!email)
    return undefined

  const user = await findUserByEmail(email)
  if (!user)
    return undefined

  const bridge = await bridgeMinisiteUser(user)
  if (!bridge?.token)
    return undefined

  await setUserSession(event, {
    ...session,
    minisiteToken: bridge.token,
    minisiteUserId: bridge.user.id,
    ...(bridge.user.persona && !session.personaId
      ? { personaId: bridge.user.persona, onboardingComplete: true }
      : {}),
  })

  return bridge.token
}

export async function buildSessionWithMinisiteBridge(user: StoredUser) {
  const bridge = await bridgeMinisiteUser(user)
  const synced = bridge?.user.persona && !user.personaId
    ? { ...user, personaId: bridge.user.persona, onboardingComplete: true }
    : user

  return {
    payload: {
      user: {
        email: synced.email,
        name: `${synced.firstName} ${synced.lastName}`.trim() || synced.email,
      },
      onboardingComplete: synced.onboardingComplete,
      personaId: synced.personaId,
      loggedInAt: Date.now(),
      ...(bridge
        ? { minisiteToken: bridge.token, minisiteUserId: bridge.user.id }
        : {}),
    },
    user: synced,
  }
}
