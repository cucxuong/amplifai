import { loginWithPassword } from '../../services/auth/credentials.service'
import { buildAuthSessionPayload, findUserByEmail } from '../../services/auth/users.store'

interface LoginBody {
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)
  const email = body.email ?? ''
  const password = body.password ?? ''

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const result = await loginWithPassword(email, password)
  if (!result.ok) {
    if (result.reason === 'email_not_verified') {
      throw createError({
        statusCode: 403,
        message: 'Please verify your email before signing in.',
        data: { code: 'EMAIL_NOT_VERIFIED', email },
      })
    }
    throw createError({
      statusCode: 401,
      message: result.reason === 'not_found' ? 'No account found for this email' : 'Password is incorrect',
    })
  }

  const stored = await findUserByEmail(result.user.email)
  if (!stored) {
    throw createError({ statusCode: 404, message: 'Account not found' })
  }

  await setUserSession(event, buildAuthSessionPayload(stored))

  return { ok: true }
})
