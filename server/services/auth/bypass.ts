export function isAuthBypassEnabled(): boolean {
  return useRuntimeConfig().authBypass === true
}

export function isBypassOtpCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim())
}
