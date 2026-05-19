interface PersonaBody {
  personaId?: string
  skip?: boolean
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const body = await readBody<PersonaBody>(event)

  if (body.skip) {
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

  await setUserSession(event, {
    ...session,
    onboardingComplete: true,
    personaId: body.personaId,
  })

  return { ok: true }
})
