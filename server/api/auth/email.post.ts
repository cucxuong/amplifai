import { signInWithEmail } from '../../services/auth/auth.service'

interface EmailBody {
  email?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<EmailBody>(event)
  const email = body.email ?? ''

  const { email: normalized, name } = await signInWithEmail(email)

  await setUserSession(event, {
    user: { email: normalized, name },
    onboardingComplete: false,
    loggedInAt: Date.now(),
  })

  return { ok: true }
})
