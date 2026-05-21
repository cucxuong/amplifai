import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { isValidEmail, normalizeEmail } from './auth.service'
import { isAuthBypassEnabled, isDemoGuestLogin, DEMO_GUEST_EMAIL, DEMO_GUEST_PASSWORD } from './bypass'
import {
  displayName,
  findUserByEmail,
  saveUser,
  updateUser,
  type StoredUser,
} from './users.store'

const scryptAsync = promisify(scrypt)

const MIN_PASSWORD_LENGTH = 6

export interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthUserResult {
  email: string
  name: string
}

function assertPassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw createError({
      statusCode: 400,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    })
  }
}

async function hashPassword(password: string): Promise<{ hash: string, salt: string }> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return { hash: derived.toString('hex'), salt }
}

async function verifyPasswordHash(password: string, hash: string, salt: string): Promise<boolean> {
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  const hashBuf = Buffer.from(hash, 'hex')
  if (hashBuf.length !== derived.length)
    return false
  return timingSafeEqual(hashBuf, derived)
}

export type LoginFailureReason = 'not_found' | 'wrong_password' | 'email_not_verified'

export async function register(input: RegisterInput): Promise<StoredUser> {
  const email = normalizeEmail(input.email)
  if (!isValidEmail(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  if (!firstName || !lastName) {
    throw createError({ statusCode: 400, message: 'First and last name are required' })
  }

  assertPassword(input.password)

  const existing = await findUserByEmail(email)
  if (existing?.emailVerified) {
    throw createError({ statusCode: 409, message: 'This email is already registered' })
  }

  const { hash, salt } = await hashPassword(input.password)

  if (existing) {
    const updated = await updateUser(email, {
      firstName,
      lastName,
      passwordHash: hash,
      passwordSalt: salt,
      emailVerified: false,
    })
    if (!updated) {
      throw createError({ statusCode: 500, message: 'Could not update account' })
    }
    return updated
  }

  const user: StoredUser = {
    email,
    firstName,
    lastName,
    passwordHash: hash,
    passwordSalt: salt,
    emailVerified: false,
    onboardingComplete: false,
    personaId: null,
    createdAt: Date.now(),
  }

  await saveUser(user)
  return user
}

async function ensureDemoGuestUser(): Promise<StoredUser> {
  const existing = await findUserByEmail(DEMO_GUEST_EMAIL)
  if (existing) {
    if (!existing.emailVerified) {
      const updated = await updateUser(DEMO_GUEST_EMAIL, { emailVerified: true })
      if (updated)
        return updated
    }
    return existing
  }

  const { hash, salt } = await hashPassword(DEMO_GUEST_PASSWORD)
  const user: StoredUser = {
    email: DEMO_GUEST_EMAIL,
    firstName: 'Guest',
    lastName: 'User',
    passwordHash: hash,
    passwordSalt: salt,
    emailVerified: true,
    onboardingComplete: false,
    personaId: null,
    createdAt: Date.now(),
  }
  await saveUser(user)
  return user
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true, user: AuthUserResult } | { ok: false, reason: LoginFailureReason }> {
  const normalized = normalizeEmail(email)

  if (isDemoGuestLogin(normalized, password)) {
    const user = await ensureDemoGuestUser()
    return {
      ok: true,
      user: { email: user.email, name: displayName(user) },
    }
  }

  const user = await findUserByEmail(normalized)
  if (!user)
    return { ok: false, reason: 'not_found' }

  if (isAuthBypassEnabled()) {
    if (!user.emailVerified)
      return { ok: false, reason: 'email_not_verified' }

    return {
      ok: true,
      user: { email: user.email, name: displayName(user) },
    }
  }

  const valid = await verifyPasswordHash(password, user.passwordHash, user.passwordSalt)
  if (!valid)
    return { ok: false, reason: 'wrong_password' }

  if (!user.emailVerified)
    return { ok: false, reason: 'email_not_verified' }

  return {
    ok: true,
    user: { email: user.email, name: displayName(user) },
  }
}

/** @deprecated Use loginWithPassword */
export async function verifyPassword(email: string, password: string): Promise<AuthUserResult | null> {
  const result = await loginWithPassword(email, password)
  return result.ok ? result.user : null
}

export async function markEmailVerified(email: string): Promise<AuthUserResult | null> {
  const user = await updateUser(email, { emailVerified: true })
  if (!user)
    return null
  return { email: user.email, name: displayName(user) }
}

export async function resetPassword(email: string, password: string): Promise<AuthUserResult | null> {
  assertPassword(password)
  const { hash, salt } = await hashPassword(password)
  const user = await updateUser(email, { passwordHash: hash, passwordSalt: salt, emailVerified: true })
  if (!user)
    return null
  return { email: user.email, name: displayName(user) }
}

export async function userExists(email: string): Promise<boolean> {
  const user = await findUserByEmail(normalizeEmail(email))
  return Boolean(user)
}
