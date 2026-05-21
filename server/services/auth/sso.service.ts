import { isValidEmail, normalizeEmail } from './auth.service'
import {
  findUserByAzureOid,
  findUserByEmail,
  saveUser,
  updateUser,
  type StoredUser,
} from './users.store'

export interface MicrosoftGraphUser {
  id?: string
  mail?: string | null
  userPrincipalName?: string | null
  givenName?: string | null
  surname?: string | null
  displayName?: string | null
}

export const DEV_MOCK_SSO_EMAIL = 'dev.user@loreal.com'

const ALLOWED_EMAIL_DOMAIN = '@loreal.com'

function resolveSsoEmail(graphUser: MicrosoftGraphUser): string {
  const raw = graphUser.mail?.trim() || graphUser.userPrincipalName?.trim() || ''
  return normalizeEmail(raw)
}

function assertAllowedEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw createError({ statusCode: 401, message: 'Microsoft account email is invalid' })
  }

  if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
    throw createError({
      statusCode: 403,
      message: `Only ${ALLOWED_EMAIL_DOMAIN} accounts can sign in`,
    })
  }
}

export async function findOrCreateSsoUser(graphUser: MicrosoftGraphUser): Promise<StoredUser> {
  const azureOid = graphUser.id?.trim()
  if (!azureOid) {
    throw createError({ statusCode: 401, message: 'Microsoft account id is missing' })
  }

  const byOid = await findUserByAzureOid(azureOid)
  if (byOid)
    return byOid

  const email = resolveSsoEmail(graphUser)
  assertAllowedEmail(email)

  const existing = await findUserByEmail(email)
  if (existing) {
    const updated = await updateUser(email, {
      azureOid,
      authProvider: 'azure',
      firstName: existing.firstName || graphUser.givenName?.trim() || '',
      lastName: existing.lastName || graphUser.surname?.trim() || '',
      emailVerified: true,
    })
    return updated ?? existing
  }

  const user: StoredUser = {
    email,
    firstName: graphUser.givenName?.trim() || '',
    lastName: graphUser.surname?.trim() || '',
    emailVerified: true,
    onboardingComplete: false,
    personaId: null,
    createdAt: Date.now(),
    authProvider: 'azure',
    azureOid,
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
    authProvider: 'azure',
    azureOid: 'dev-mock-oid',
  }

  await saveUser(user)
  return user
}
