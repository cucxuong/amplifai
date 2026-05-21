import { isAuthBypassEnabled } from '../../services/auth/bypass'
import { findOrCreateDevMockUser } from '../../services/auth/sso.service'
import { buildSessionWithMinisiteBridge } from '../../services/minisite/bridge.service'

export default defineEventHandler(async (event) => {
  if (!isAuthBypassEnabled()) {
    throw createError({
      statusCode: 403,
      message: 'Dev session is only available when NUXT_AUTH_BYPASS is enabled',
    })
  }

  const user = await findOrCreateDevMockUser()
  const { payload } = await buildSessionWithMinisiteBridge(user)
  await setUserSession(event, payload)

  return { ok: true, minisiteLinked: !!payload.minisiteToken }
})
