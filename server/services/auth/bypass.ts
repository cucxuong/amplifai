function isTruthyEnv(value: unknown): boolean {
  return value === true || value === 'true' || value === '1'
}

export function isAuthBypassEnabled(): boolean {
  return isTruthyEnv(useRuntimeConfig().authBypass)
}

export function isBypassOtpCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim())
}
