import { randomBytes } from 'node:crypto'

interface ResetTokenEntry {
  email: string
  expiresAt: number
}

const resetTokens = new Map<string, ResetTokenEntry>()

const RESET_TTL_MS = 15 * 60 * 1000

export function issueResetToken(email: string): string {
  const token = randomBytes(24).toString('hex')
  resetTokens.set(token, {
    email: email.toLowerCase(),
    expiresAt: Date.now() + RESET_TTL_MS,
  })
  return token
}

export function consumeResetToken(token: string, email: string): boolean {
  const entry = resetTokens.get(token)
  if (!entry || entry.expiresAt < Date.now())
    return false
  if (entry.email !== email.toLowerCase())
    return false
  resetTokens.delete(token)
  return true
}
