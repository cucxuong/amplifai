const otpStore = new Map<string, { code: string, expiresAt: number }>()

const OTP_TTL_MS = 10 * 60 * 1000

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function storeOtp(email: string, code: string): void {
  otpStore.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  })
}

/** Placeholder: in-memory verification for dev. Replace with Redis/DB. */
export function verifyOtp(email: string, code: string): boolean {
  const entry = otpStore.get(email.toLowerCase())
  if (!entry || entry.expiresAt < Date.now())
    return false
  return entry.code === code
}
