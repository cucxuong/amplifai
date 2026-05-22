/**
 * POST /api/minisite/schedule/remove
 * Remove a session from user's saved schedule
 */
interface RemoveScheduleRequest {
  sessionId: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RemoveScheduleRequest>(event)

  if (!body.sessionId) {
    throw createError({
      statusCode: 400,
      message: 'sessionId is required',
    })
  }

  // Call backend endpoint to remove session from schedule
  return proxyMinisitePost(event, 'user/schedule/remove')
})
