import { normalizeEmail, isValidEmail } from '../../services/auth/auth.service'
import { userExists } from '../../services/auth/credentials.service'
import { generateOtp, storeOtp } from '../../services/auth/otp.service'
import { sendOtpEmail } from '../../services/auth/smtp.service'

interface ForgotBody {
  email?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ForgotBody>(event)
  const email = normalizeEmail(body.email ?? '')

  if (!isValidEmail(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  if (await userExists(email)) {
    const code = generateOtp()
    await storeOtp(email, code, 'reset')
    await sendOtpEmail({ to: email, code })
  }

  return { ok: true }
})
