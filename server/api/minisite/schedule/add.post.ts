/**
 * POST /api/minisite/schedule/add
 * Add a session to user's saved schedule
 */
interface AddScheduleRequest {
  sessionId: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AddScheduleRequest>(event)

  if (!body.sessionId) {
    throw createError({
      statusCode: 400,
      message: 'sessionId is required',
    })
  }

  // Call backend endpoint to add session to schedule
  // proxyMinisitePost will use the body from the event
  return proxyMinisitePost(event, 'user/schedule/add')
})
