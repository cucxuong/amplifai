import { isAuthBypassEnabled } from '../../services/auth/bypass'
import { findOrCreateDevMockUser } from '../../services/auth/sso.service'
import { buildUserSessionPayload } from '../../services/minisite/session.service'

export default defineEventHandler(async (event) => {
  if (!isAuthBypassEnabled()) {
    throw createError({
      statusCode: 403,
      message: 'Dev session is only available when NUXT_AUTH_BYPASS is enabled',
    })
  }

  const user = await findOrCreateDevMockUser()
  const payload = buildUserSessionPayload(user)
  await setUserSession(event, payload)

  return { ok: true as const }
})
