export default defineEventHandler(async (event) => {
  return proxyMinisitePost(event, 'qr/redeem')
})
