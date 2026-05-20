import { normalizeEmail, isValidEmail } from '../../services/auth/auth.service'
import { resetPassword } from '../../services/auth/credentials.service'
import { consumeResetToken } from '../../services/auth/reset-token.service'
import { buildAuthSessionPayload, findUserByEmail } from '../../services/auth/users.store'

interface ResetBody {
  email?: string
  password?: string
  resetToken?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ResetBody>(event)
  const email = normalizeEmail(body.email ?? '')
  const password = body.password ?? ''
  const resetToken = body.resetToken ?? ''

  if (!isValidEmail(email) || !password || !resetToken) {
    throw createError({ statusCode: 400, message: 'Email, password, and reset token are required' })
  }

  if (!consumeResetToken(resetToken, email)) {
    throw createError({ statusCode: 400, message: 'Invalid or expired reset session' })
  }

  const user = await resetPassword(email, password)
  if (!user) {
    throw createError({ statusCode: 404, message: 'Account not found' })
  }

  const stored = await findUserByEmail(email)
  if (!stored) {
    throw createError({ statusCode: 404, message: 'Account not found' })
  }

  await setUserSession(event, buildAuthSessionPayload(stored))

  return { ok: true }
})
