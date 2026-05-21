const REMOVED_MESSAGE
  = 'Email/password authentication is no longer supported. Sign in with Microsoft SSO at /sign-in.'

export function authEndpointRemoved(): never {
  throw createError({
    statusCode: 410,
    message: REMOVED_MESSAGE,
  })
}
