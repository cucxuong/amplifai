import { isValidEmail, normalizeEmail } from './auth.service'
import {
  findUserByEmail,
  findUserBySsoSubjectId,
  saveUser,
  updateUser,
  type StoredUser,
} from './users.store'

export interface SamlUserClaims {
  email: string
  firstName: string
  lastName: string
  externalId: string
}

export const DEV_MOCK_SSO_EMAIL = 'dev.user@loreal.com'

const ALLOWED_EMAIL_DOMAIN = '@loreal.com'


function assertAllowedEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw createError({ statusCode: 401, message: 'SAML account email is invalid' })
  }

  if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
    throw createError({
      statusCode: 403,
      message: `Only ${ALLOWED_EMAIL_DOMAIN} accounts can sign in`,
    })
  }
}

export async function findOrCreateSamlUser(claims: SamlUserClaims): Promise<StoredUser> {
  const externalId = claims.externalId?.trim()
  if (!externalId) {
    throw createError({ statusCode: 401, message: 'SAML user id is missing' })
  }

  const bySubject = await findUserBySsoSubjectId(externalId)
  if (bySubject)
    return bySubject

  const email = normalizeEmail(claims.email)
  assertAllowedEmail(email)

  const existing = await findUserByEmail(email)
  if (existing) {
    const updated = await updateUser(email, {
      ssoSubjectId: externalId,
      authProvider: 'saml',
      firstName: existing.firstName || claims.firstName,
      lastName: existing.lastName || claims.lastName,
      emailVerified: true,
    })
    return updated ?? existing
  }

  const user: StoredUser = {
    email,
    firstName: claims.firstName,
    lastName: claims.lastName,
    emailVerified: true,
    onboardingComplete: false,
    personaId: null,
    createdAt: Date.now(),
    authProvider: 'saml',
    ssoSubjectId: externalId,
  }

  await saveUser(user)
  return user
}

export async function findOrCreateDevMockUser(): Promise<StoredUser> {
  const existing = await findUserByEmail(DEV_MOCK_SSO_EMAIL)
  if (existing)
    return existing

  const user: StoredUser = {
    email: DEV_MOCK_SSO_EMAIL,
    firstName: 'Dev',
    lastName: 'User',
    emailVerified: true,
    onboardingComplete: false,
    personaId: null,
    createdAt: Date.now(),
    authProvider: 'saml',
    ssoSubjectId: 'dev-mock-oid',
  }

  await saveUser(user)
  return user
}
