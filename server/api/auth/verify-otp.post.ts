/** Placeholder route for future OTP verification. */
export default defineEventHandler(() => {
  throw createError({
    statusCode: 501,
    message: 'OTP verification is not implemented yet',
  })
})
