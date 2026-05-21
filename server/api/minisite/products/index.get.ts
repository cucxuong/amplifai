export default defineEventHandler(async (event) => {
  return proxyMinisiteGet(event, 'products')
})
