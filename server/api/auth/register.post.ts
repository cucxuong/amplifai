import { normalizeEmail } from '../../services/auth/auth.service'
import { register } from '../../services/auth/credentials.service'
import { generateOtp, storeOtp } from '../../services/auth/otp.service'
import { sendOtpEmail } from '../../services/auth/smtp.service'

interface RegisterBody {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)

  const user = await register({
    email: body.email ?? '',
    password: body.password ?? '',
    firstName: body.firstName ?? '',
    lastName: body.lastName ?? '',
  })

  const code = generateOtp()
  await storeOtp(user.email, code, 'signup')
  await sendOtpEmail({ to: user.email, code })

  return { ok: true, email: normalizeEmail(user.email) }
})
