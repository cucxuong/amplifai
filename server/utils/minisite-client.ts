import type { H3Event } from 'h3'
import type { FetchError } from 'ofetch'
import type { MinisiteApiEnvelope, MinisitePaginatedEnvelope } from '#shared/types/minisite'

interface MinisiteFetchOptions {
  method?: string
  token?: string
  internalKey?: string
  query?: Record<string, unknown>
  body?: Record<string, unknown>
}

function minisiteBaseUrl(): string {
  const config = useRuntimeConfig()
  return config.minisiteApiBase.replace(/\/$/, '')
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

export async function minisiteFetch<T>(
  path: string,
  options: MinisiteFetchOptions = {},
): Promise<T> {
  const url = `${minisiteBaseUrl()}/api/${path.replace(/^\//, '')}`
  try {
    const res = await $fetch<MinisiteApiEnvelope<T>>(url, {
      method: (options.method ?? 'GET') as 'GET' | 'POST' | 'PATCH' | 'DELETE',
      headers: {
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.internalKey ? { 'X-Internal-Key': options.internalKey } : {}),
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
  const url = `${minisiteBaseUrl()}/api/${path.replace(/^\//, '')}`
  try {
    const res = await $fetch<MinisitePaginatedEnvelope<T>>(url, {
      method: (options.method ?? 'GET') as 'GET' | 'POST' | 'PATCH' | 'DELETE',
      headers: {
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.internalKey ? { 'X-Internal-Key': options.internalKey } : {}),
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

  const { tryRebridgeMinisiteSession } = await import('../services/minisite/bridge.service')
  const rebridged = await tryRebridgeMinisiteSession(event, session)
  if (rebridged)
    return rebridged

  throw createError({
    statusCode: 401,
    message: 'Minisite session is missing — sign in again',
  })
}

export async function proxyMinisiteGet<T>(event: H3Event, path: string): Promise<T> {
  const token = await requireMinisiteToken(event)
  return minisiteFetch<T>(path, { token, query: getQuery(event) })
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
