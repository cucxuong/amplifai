const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface SignInWithEmailResult {
  email: string
  name: string
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email)
}

/** Email-only sign-in for MVP. OTP/password wired in a later phase. */
export async function signInWithEmail(email: string): Promise<SignInWithEmailResult> {
  const normalized = normalizeEmail(email)
  if (!isValidEmail(normalized)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  const name = normalized.split('@')[0] ?? normalized

  return { email: normalized, name }
}
