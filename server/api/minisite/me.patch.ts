import { updateUser } from '../../services/auth/users.store'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody<{ firstName?: string, lastName?: string, persona?: string }>(event)
  const updated = await proxyMinisitePatch(event, 'me')

  if (body.persona !== undefined) {
    await updateUser(session.user.email, {
      personaId: body.persona || null,
      onboardingComplete: true,
    })
    await setUserSession(event, {
      ...session,
      personaId: body.persona || null,
      onboardingComplete: true,
    })
  }

  return updated
})
