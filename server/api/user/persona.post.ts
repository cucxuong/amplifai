import { updateUser } from '../../services/auth/users.store'

interface PersonaBody {
  personaId?: string
  skip?: boolean
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody<PersonaBody>(event)
  const email = session.user.email

  if (body.skip) {
    await updateUser(email, { onboardingComplete: true, personaId: null })
    await setUserSession(event, {
      ...session,
      onboardingComplete: true,
      personaId: null,
    })
    return { ok: true }
  }

  if (!body.personaId) {
    throw createError({ statusCode: 400, message: 'personaId is required' })
  }

  await updateUser(email, { onboardingComplete: true, personaId: body.personaId })
  await setUserSession(event, {
    ...session,
    onboardingComplete: true,
    personaId: body.personaId,
  })

  return { ok: true }
})
