import { readAuthRecord, writeAuthRecord } from './auth-storage'

export interface StoredUser {
  email: string
  firstName: string
  lastName: string
  passwordHash?: string
  passwordSalt?: string
  emailVerified: boolean
  onboardingComplete: boolean
  personaId: string | null
  createdAt: number
  authProvider?: 'azure' | 'local'
  azureOid?: string
}

const STORAGE_KEY = 'auth:users'

function normalizeStoredUser(raw: StoredUser): StoredUser {
  return {
    ...raw,
    onboardingComplete: raw.onboardingComplete ?? false,
    personaId: raw.personaId ?? null,
    authProvider: raw.authProvider ?? (raw.azureOid ? 'azure' : 'local'),
  }
}

type UsersRecord = Record<string, StoredUser>

async function readUsers(): Promise<UsersRecord> {
  const data = await readAuthRecord<UsersRecord>(STORAGE_KEY)
  if (!data)
    return {}
  const normalized: UsersRecord = {}
  for (const [key, user] of Object.entries(data))
    normalized[key] = normalizeStoredUser(user)
  return normalized
}

async function writeUsers(users: UsersRecord): Promise<void> {
  await writeAuthRecord(STORAGE_KEY, users)
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await readUsers()
  const user = users[email.toLowerCase()]
  return user ? normalizeStoredUser(user) : null
}

export async function findUserByAzureOid(oid: string): Promise<StoredUser | null> {
  const users = await readUsers()
  const match = Object.values(users).find(user => user.azureOid === oid)
  return match ? normalizeStoredUser(match) : null
}

export async function saveUser(user: StoredUser): Promise<void> {
  const users = await readUsers()
  users[user.email] = normalizeStoredUser(user)
  await writeUsers(users)
}

export async function updateUser(
  email: string,
  patch: Partial<
    Pick<
      StoredUser,
      | 'passwordHash'
      | 'passwordSalt'
      | 'emailVerified'
      | 'firstName'
      | 'lastName'
      | 'onboardingComplete'
      | 'personaId'
      | 'authProvider'
      | 'azureOid'
    >
  >,
): Promise<StoredUser | null> {
  const users = await readUsers()
  const key = email.toLowerCase()
  const existing = users[key]
  if (!existing)
    return null
  const updated = normalizeStoredUser({ ...existing, ...patch, email: key })
  users[key] = updated
  await writeUsers(users)
  return updated
}

export function displayName(user: Pick<StoredUser, 'firstName' | 'lastName' | 'email'>): string {
  const full = `${user.firstName} ${user.lastName}`.trim()
  return full || user.email.split('@')[0] || user.email
}

export function buildAuthSessionPayload(user: StoredUser) {
  return {
    user: { email: user.email, name: displayName(user) },
    onboardingComplete: user.onboardingComplete,
    personaId: user.personaId,
    loggedInAt: Date.now(),
  }
}
