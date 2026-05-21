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

function isHttpError(err: unknown): err is { statusCode: number } {
  return Boolean(err && typeof err === 'object' && 'statusCode' in err)
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)

  try {
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
  }
  catch (err: unknown) {
    if (isHttpError(err))
      throw err

    console.error('[auth/register]', err)
    throw createError({ statusCode: 500, message: 'Registration failed' })
  }
})
