export default defineEventHandler(async (event) => {
  return proxyMinisitePost(event, 'orders/redeem')
})
