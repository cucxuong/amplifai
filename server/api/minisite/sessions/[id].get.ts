export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'Session id is required' })
  }
  return proxyMinisiteGet(event, `sessions/${id}`)
})
