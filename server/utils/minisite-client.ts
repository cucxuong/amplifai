import type { H3Event } from 'h3'
import type { FetchError } from 'ofetch'
import type { MinisiteApiEnvelope, MinisitePaginatedEnvelope } from '#shared/types/minisite'
import { isAuthBypassEnabled } from '../services/auth/bypass'
import { getMockUserProfile, getMockLeaderboard, getMockSessions, getMockProducts, getMockAdminStats, simulateQrRedeem, simulateOrderRedeem } from './mock-api-responses'

interface MinisiteFetchOptions {
  method?: string
  token?: string
  /** When minisite sets PUBLIC_API_KEY; forwarded as X-API-Key. */
  publicApiKey?: string
  query?: Record<string, unknown>
  body?: Record<string, unknown>
}

function minisiteBaseUrl(): string {
  const config = useRuntimeConfig()
  return config.minisiteApiBase.replace(/\/$/, '')
}

/**
 * Check if we should use mock responses (when mock SSO is enabled)
 */
function shouldUseMockResponses(): boolean {
  return isAuthBypassEnabled()
}

function unwrapMinisiteError(error: unknown): never {
  const fetchError = error as FetchError<MinisiteApiEnvelope<unknown>>
  const status = fetchError.response?.status ?? fetchError.statusCode ?? 502
  const message = fetchError.data?.error
    ?? fetchError.statusMessage
    ?? fetchError.message
    ?? 'Minisite API request failed'
  throw createError({ statusCode: status, message })
}

/**
 * Handle mock API responses (when mock SSO is enabled)
 */
async function handleMockFetch<T>(
  path: string,
  options: MinisiteFetchOptions,
): Promise<T> {
  const { token } = options
  const normalizedPath = path.replace(/^\//, '')

  // Get email from token (format: email:iat:exp:random)
  let email = 'dev.user@loreal.com'
  if (token) {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const [tokenEmail] = decoded.split(':')
      if (tokenEmail)
        email = tokenEmail
    }
    catch {
      // Ignore decode errors, use default
    }
  }

  // Handle common endpoints with mock data
  if (normalizedPath === 'me' && options.method === 'GET') {
    return { success: true, data: getMockUserProfile(email) } as unknown as T
  }

  if (normalizedPath === 'me' && options.method === 'PATCH') {
    const body = options.body as Record<string, any>
    const updates = {
      firstName: body.firstName,
      lastName: body.lastName,
      personaId: body.personaId,
    }
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    )
    return { success: true, data: { ...getMockUserProfile(email), ...filtered } } as unknown as T
  }

  if (normalizedPath === 'public/leaderboard') {
    return { success: true, data: getMockLeaderboard() } as unknown as T
  }

  if (normalizedPath === 'public/sessions' || normalizedPath === 'public/sessions/') {
    return { success: true, data: getMockSessions() } as unknown as T
  }

  if (normalizedPath === 'public/products' || normalizedPath === 'public/products/') {
    return { success: true, data: getMockProducts() } as unknown as T
  }

  if (normalizedPath === 'admin/stats') {
    return { success: true, data: getMockAdminStats() } as unknown as T
  }

  if (normalizedPath === 'check-in' && options.method === 'POST') {
    const body = options.body as Record<string, any>
    return { success: true, data: simulateQrRedeem(email, body.sessionId, body.campaignId, body.value) } as unknown as T
  }

  if (normalizedPath === 'orders/redeem' && options.method === 'POST') {
    const body = options.body as Record<string, any>
    return { success: true, data: simulateOrderRedeem(email, body.productId, body.sparksCost) } as unknown as T
  }

  // For unmapped endpoints, return a reasonable default
  console.warn(`[Mock API] Unmapped endpoint: ${normalizedPath}`)
  return { success: true, data: null } as unknown as T
}

export async function minisiteFetch<T>(
  path: string,
  options: MinisiteFetchOptions = {},
): Promise<T> {
  // Always use real Minisite backend API
  // (Mock SSO is only for authentication, not API responses)
  const url = `${minisiteBaseUrl()}/api/${path.replace(/^\//, '')}`
  try {
    const res = await $fetch<MinisiteApiEnvelope<T>>(url, {
      method: (options.method ?? 'GET') as 'GET' | 'POST' | 'PATCH' | 'DELETE',
      headers: {
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.publicApiKey ? { 'X-API-Key': options.publicApiKey } : {}),
      },
      query: options.query,
      body: options.body,
    })
    if (!res.success)
      throw createError({ statusCode: 502, message: res.error || 'Minisite API error' })
    return res.data as T
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error)
      throw error
    unwrapMinisiteError(error)
  }
}

export async function minisiteFetchPaginated<T>(
  path: string,
  options: MinisiteFetchOptions = {},
): Promise<MinisitePaginatedEnvelope<T>> {
  // Always use real Minisite backend API
  // (Mock SSO is only for authentication, not API responses)
  const url = `${minisiteBaseUrl()}/api/${path.replace(/^\//, '')}`
  try {
    const res = await $fetch<MinisitePaginatedEnvelope<T>>(url, {
      method: (options.method ?? 'GET') as 'GET' | 'POST' | 'PATCH' | 'DELETE',
      headers: {
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.publicApiKey ? { 'X-API-Key': options.publicApiKey } : {}),
      },
      query: options.query,
      body: options.body,
    })
    if (!res.success)
      throw createError({ statusCode: 502, message: res.error || 'Minisite API error' })
    return res
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error)
      throw error
    unwrapMinisiteError(error)
  }
}

export async function requireMinisiteToken(event: H3Event): Promise<string> {
  const session = await requireUserSession(event)
  const token = session.minisiteToken
  if (typeof token === 'string' && token)
    return token

  throw createError({
    statusCode: 401,
    message: 'Minisite session is missing — sign in again',
  })
}

export async function proxyMinisiteGet<T>(event: H3Event, path: string): Promise<T> {
  const token = await requireMinisiteToken(event)
  return minisiteFetch<T>(path, { token, query: getQuery(event) })
}

export async function proxyMinisitePublicGet<T>(event: H3Event, path: string): Promise<T> {
  const config = useRuntimeConfig()
  const key = typeof config.minisitePublicApiKey === 'string' ? config.minisitePublicApiKey.trim() : ''
  return minisiteFetch<T>(path, {
    query: getQuery(event),
    ...(key ? { publicApiKey: key } : {}),
  })
}

export async function proxyMinisitePost<T>(event: H3Event, path: string): Promise<T> {
  const token = await requireMinisiteToken(event)
  const body = await readBody(event)
  return minisiteFetch<T>(path, { method: 'POST', token, body })
}

export async function proxyMinisitePatch<T>(event: H3Event, path: string): Promise<T> {
  const token = await requireMinisiteToken(event)
  const body = await readBody(event)
  return minisiteFetch<T>(path, { method: 'PATCH', token, body })
}
