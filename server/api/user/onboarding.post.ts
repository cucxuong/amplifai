import { updateUser } from '../../services/auth/users.store'

interface OnboardingBody {
  personaId?: string | null
  skip?: boolean
  onboardingComplete?: boolean
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody<OnboardingBody>(event)

  if (body.skip) {
    await updateUser(session.user.email, { onboardingComplete: true, personaId: null })
    await setUserSession(event, {
      ...session,
      onboardingComplete: true,
      personaId: null,
    })
    return { ok: true }
  }

  const personaId = body.personaId ?? session.personaId ?? null
  await updateUser(session.user.email, {
    onboardingComplete: body.onboardingComplete ?? true,
    personaId,
  })
  await setUserSession(event, {
    ...session,
    onboardingComplete: body.onboardingComplete ?? true,
    personaId,
  })

  return { ok: true }
})
