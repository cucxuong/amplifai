import { normalizeEmail, isValidEmail } from '../../services/auth/auth.service'
import { markEmailVerified } from '../../services/auth/credentials.service'
import { verifyOtp, type OtpPurpose } from '../../services/auth/otp.service'
import { issueResetToken } from '../../services/auth/reset-token.service'

interface VerifyOtpBody {
  email?: string
  code?: string
  purpose?: OtpPurpose
}

export default defineEventHandler(async (event) => {
  const body = await readBody<VerifyOtpBody>(event)
  const email = normalizeEmail(body.email ?? '')
  const code = (body.code ?? '').trim()
  const purpose = body.purpose

  if (!isValidEmail(email) || !code || !purpose) {
    throw createError({ statusCode: 400, message: 'Email, code, and purpose are required' })
  }

  if (!(await verifyOtp(email, code, purpose))) {
    throw createError({ statusCode: 400, message: 'Invalid or expired code' })
  }

  if (purpose === 'signup') {
    const user = await markEmailVerified(email)
    if (!user) {
      throw createError({ statusCode: 404, message: 'Account not found' })
    }

    return { ok: true, redirectToSignIn: true }
  }

  if (purpose === 'reset') {
    const resetToken = issueResetToken(email)
    return { ok: true, resetToken }
  }

  throw createError({ statusCode: 400, message: 'Invalid purpose' })
})
