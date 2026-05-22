export default defineEventHandler(async (event) => {
  return proxyMinisitePublicGet(event, 'public/leaderboard')
})
