export function useMinisiteStatus() {
  const unavailable = useState('minisiteUnavailable', () => false)

  function markUnavailable() {
    unavailable.value = true
  }

  function clearUnavailable() {
    unavailable.value = false
  }

  return { unavailable, markUnavailable, clearUnavailable }
}

function isUnauthorizedError(error: unknown): boolean {
  const status = (error as { statusCode?: number })?.statusCode
    ?? (error as { response?: { status?: number } })?.response?.status
  return status === 401
}

export { isUnauthorizedError }
