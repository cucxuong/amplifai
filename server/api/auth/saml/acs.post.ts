import { parseAcsResponse } from '../../../services/auth/saml.service'
import { findOrCreateSamlUser, mapSamlProfileToClaims } from '../../../services/auth/sso.service'
import { buildAuthSessionPayload } from '../../../services/auth/users.store'

export default defineEventHandler(async (event) => {
  const contentType = getRequestHeader(event, 'content-type') || ''
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    throw createError({
      statusCode: 415,
      message: 'ACS expects application/x-www-form-urlencoded',
    })
  }

  const body = await readBody<Record<string, unknown>>(event)

  try {
    const profile = await parseAcsResponse(body)
    const claims = mapSamlProfileToClaims(profile)
    const stored = await findOrCreateSamlUser(claims)
    await setUserSession(event, buildAuthSessionPayload(stored))
    return sendRedirect(event, '/')
  }
  catch {
    return sendRedirect(event, '/sign-in?error=sso_failed')
  }
})
