import { isAuthBypassEnabled } from '../../services/auth/bypass'
import { findOrCreateDevMockUser } from '../../services/auth/sso.service'
import { buildAuthSessionPayload } from '../../services/auth/users.store'

export default defineEventHandler(async (event) => {
  if (!isAuthBypassEnabled()) {
    throw createError({
      statusCode: 403,
      message: 'Dev session is only available when NUXT_AUTH_BYPASS is enabled',
    })
  }

  const user = await findOrCreateDevMockUser()
  await setUserSession(event, buildAuthSessionPayload(user))

  return { ok: true }
})
