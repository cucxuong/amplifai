export function authErrorData(err: unknown): Record<string, unknown> | null {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: unknown }).data
    if (data && typeof data === 'object')
      return data as Record<string, unknown>
  }
  return null
}

export function authErrorMessage(err: unknown, fallback: string): string {
  const data = authErrorData(err)
  if (data && typeof data.message === 'string')
    return data.message
  return fallback
}

export function authErrorCode(err: unknown): string | null {
  const data = authErrorData(err)
  if (!data)
    return null
  const nested = data.data
  if (nested && typeof nested === 'object' && 'code' in nested)
    return String((nested as { code: string }).code)
  if ('code' in data)
    return String(data.code)
  return null
}

export function authErrorStatus(err: unknown): number | null {
  const data = authErrorData(err)
  if (data && typeof data.statusCode === 'number')
    return data.statusCode
  return null
}
