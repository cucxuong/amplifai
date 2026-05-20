export default defineEventHandler(() => {
  throw createError({
    statusCode: 410,
    message: 'Email-only sign-in is no longer supported. Use /api/auth/login with email and password.',
  })
})
