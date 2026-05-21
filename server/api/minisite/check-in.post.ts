export default defineEventHandler(async (event) => {
  return proxyMinisitePost(event, 'check-in')
})
