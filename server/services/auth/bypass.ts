import { normalizeEmail } from './auth.service'

function isTruthyEnv(value: unknown): boolean {
  return value === true || value === 'true' || value === '1'
}

export function isAuthBypassEnabled(): boolean {
  return isTruthyEnv(useRuntimeConfig().authBypass)
}

/** DEMO ONLY — remove before production */
export const DEMO_OTP_CODE = '111111'

/** DEMO ONLY — remove before production */
export const DEMO_GUEST_EMAIL = 'guest@loreal.com'

/** DEMO ONLY — remove before production */
export const DEMO_GUEST_PASSWORD = '123456'

export function isBypassOtpCode(code: string): boolean {
  return code.trim() === DEMO_OTP_CODE
}

export function isDemoGuestLogin(email: string, password: string): boolean {
  return normalizeEmail(email) === DEMO_GUEST_EMAIL && password === DEMO_GUEST_PASSWORD
}
