import { normalizeEmail, isValidEmail } from '../../services/auth/auth.service'
import { findUserByEmail } from '../../services/auth/users.store'
import { generateOtp, storeOtp, type OtpPurpose } from '../../services/auth/otp.service'
import { sendOtpEmail } from '../../services/auth/smtp.service'

interface ResendBody {
  email?: string
  purpose?: OtpPurpose
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ResendBody>(event)
  const email = normalizeEmail(body.email ?? '')
  const purpose = body.purpose

  if (!isValidEmail(email) || !purpose) {
    throw createError({ statusCode: 400, message: 'Email and purpose are required' })
  }

  if (purpose === 'signup') {
    const user = await findUserByEmail(email)
    if (!user) {
      throw createError({ statusCode: 404, message: 'Account not found' })
    }
    if (user.emailVerified) {
      throw createError({ statusCode: 400, message: 'Email is already verified' })
    }
  }

  const code = generateOtp()
  await storeOtp(email, code, purpose)
  await sendOtpEmail({ to: email, code })

  return { ok: true }
})
