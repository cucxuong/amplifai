/**
 * GET /api/minisite/schedule
 * Fetch current user's saved session schedule
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)

  // Fetch user's schedule from backend
  // The backend should have an endpoint like GET /api/user/schedule
  return proxyMinisiteGet(event, 'user/schedule')
})
