export default defineEventHandler(async (event) => {
  const token = await requireMinisiteToken(event)
  return minisiteFetchPaginated('orders', { token, query: getQuery(event) })
})
