export function useApi() {
  return {
    get<T>(path: string, query?: Record<string, unknown>) {
      return $fetch<T>(path, { query })
    },
    post<T>(path: string, body?: Record<string, unknown>) {
      return $fetch<T>(path, { method: 'POST', body })
    },
    patch<T>(path: string, body?: Record<string, unknown>) {
      return $fetch<T>(path, { method: 'PATCH', body })
    },
  }
}
