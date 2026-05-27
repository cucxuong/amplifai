import { getSamlInstance, extractSamlProfile } from '../../../services/auth/saml.service'
import { findOrCreateSamlUser } from '../../../services/auth/sso.service'
import { buildUserSessionPayload } from '../../../services/minisite/session.service'

export default defineEventHandler(async (event) => {
  try {
    const raw = await readRawBody(event, 'utf-8') ?? ''
    const params = new URLSearchParams(raw)
    const body: Record<string, string> = {}
    for (const [k, v] of params.entries()) body[k] = v

    const saml = getSamlInstance()
    const { profile } = await saml.validatePostResponseAsync(body)

    if (!profile) {
      throw createError({ statusCode: 401, message: 'SAML assertion returned no profile' })
    }

    const claims = extractSamlProfile(profile as Record<string, unknown>)
    const stored = await findOrCreateSamlUser({
      email: claims.email,
      firstName: claims.firstName,
      lastName: claims.lastName,
      externalId: claims.nameId,
    })

    const payload = await buildUserSessionPayload(stored)
    await setUserSession(event, payload)
    return sendRedirect(event, '/')
  }
  catch (err) {
    console.error('[SAML ACS] error:', err)
    return sendRedirect(event, '/sign-in?error=sso_failed')
  }
})
