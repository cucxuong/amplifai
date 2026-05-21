function isTruthyEnv(value: unknown): boolean {
  if (value === true)
    return true
  if (typeof value === 'string')
    return value.trim() === 'true' || value.trim() === '1'
  return false
}

function isFalsyEnv(value: unknown): boolean {
  if (value === false)
    return true
  if (typeof value === 'string')
    return value.trim() === 'false' || value.trim() === '0'
  return false
}

/**
 * Mock SSO bypass — NUXT_AUTH_BYPASS (Vercel dashboard / .env).
 * Unset → on in local dev (`import.meta.dev`); off on production deploys.
 */
export function isAuthBypassEnabled(): boolean {
  const configValue = useRuntimeConfig().authBypass
  if (isTruthyEnv(configValue))
    return true
  if (isFalsyEnv(configValue))
    return false

  return import.meta.dev
}
