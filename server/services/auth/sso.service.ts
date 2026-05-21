import type { Profile } from '@node-saml/node-saml'
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

const EMAIL_CLAIM_KEYS = [
  'email',
  'mail',
  'emailaddress',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  'nameID',
]

const FIRST_NAME_CLAIM_KEYS = [
  'givenName',
  'firstname',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
]

const LAST_NAME_CLAIM_KEYS = [
  'surname',
  'lastname',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
]

const DISPLAY_NAME_CLAIM_KEYS = [
  'displayName',
  'name',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
]

const OBJECT_ID_CLAIM_KEYS = [
  'objectidentifier',
  'objectId',
  'http://schemas.microsoft.com/identity/claims/objectidentifier',
]

function claimValue(profile: Profile, keys: string[]): string {
  for (const key of keys) {
    const raw = profile[key]
    if (typeof raw === 'string' && raw.trim())
      return raw.trim()
  }
  return ''
}

function splitDisplayName(displayName: string): { firstName: string, lastName: string } {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 0)
    return { firstName: '', lastName: '' }
  if (parts.length === 1)
    return { firstName: parts[0]!, lastName: '' }
  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(' '),
  }
}

export function mapSamlProfileToClaims(profile: Profile): SamlUserClaims {
  const emailRaw = claimValue(profile, EMAIL_CLAIM_KEYS)
  const email = normalizeEmail(emailRaw)

  const displayName = claimValue(profile, DISPLAY_NAME_CLAIM_KEYS)
  const fromDisplay = splitDisplayName(displayName)

  const firstName = claimValue(profile, FIRST_NAME_CLAIM_KEYS) || fromDisplay.firstName
  const lastName = claimValue(profile, LAST_NAME_CLAIM_KEYS) || fromDisplay.lastName

  const externalId = claimValue(profile, OBJECT_ID_CLAIM_KEYS)
    || profile.nameID?.trim()
    || email

  return { email, firstName, lastName, externalId }
}

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
