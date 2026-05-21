import { isBypassOtpCode } from './bypass'
import { readAuthRecord, writeAuthRecord } from './auth-storage'

export type OtpPurpose = 'signup' | 'reset'

interface OtpEntry {
  code: string
  purpose: OtpPurpose
  expiresAt: number
}

type OtpRecord = Record<string, OtpEntry>

const STORAGE_KEY = 'auth:otps'
const OTP_TTL_MS = 10 * 60 * 1000

function storageKey(email: string, purpose: OtpPurpose): string {
  return `${email.toLowerCase()}:${purpose}`
}

async function readOtps(): Promise<OtpRecord> {
  const data = await readAuthRecord<OtpRecord>(STORAGE_KEY)
  return data ?? {}
}

async function writeOtps(otps: OtpRecord): Promise<void> {
  await writeAuthRecord(STORAGE_KEY, otps)
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function storeOtp(email: string, code: string, purpose: OtpPurpose): Promise<void> {
  const otps = await readOtps()
  otps[storageKey(email, purpose)] = {
    code,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
  }
  await writeOtps(otps)
}

export async function verifyOtp(email: string, code: string, purpose: OtpPurpose): Promise<boolean> {
  const trimmed = code.trim()

  if (isBypassOtpCode(trimmed)) {
    const otps = await readOtps()
    delete otps[storageKey(email, purpose)]
    await writeOtps(otps)
    return true
  }

  const otps = await readOtps()
  const key = storageKey(email, purpose)
  const entry = otps[key]
  if (!entry || entry.expiresAt < Date.now())
    return false
  if (entry.code !== trimmed)
    return false
  delete otps[key]
  await writeOtps(otps)
  return true
}

export async function clearOtp(email: string, purpose: OtpPurpose): Promise<void> {
  const otps = await readOtps()
  delete otps[storageKey(email, purpose)]
  await writeOtps(otps)
}
