import { findOrCreateSamlUser } from '../../services/auth/sso.service'
import { buildUserSessionPayload } from '../../services/minisite/session.service'

export default defineOAuthMicrosoftEventHandler({
  config: {
    scope: ['User.Read'],
  },
  async onSuccess(event, { user }) {
    try {
      const email = (user.mail || user.userPrincipalName || '').toLowerCase().trim()
      const stored = await findOrCreateSamlUser({
        email,
        firstName: user.givenName || '',
        lastName: user.surname || '',
        externalId: user.id,
      })
      const payload = await buildUserSessionPayload(stored)
      await setUserSession(event, payload)
      return sendRedirect(event, '/')
    }
    catch (err) {
      console.error('[Microsoft OAuth] error:', err)
      return sendRedirect(event, '/sign-in?error=sso_failed')
    }
  },
  onError(event, error) {
    console.error('[Microsoft OAuth] OAuth error:', error)
    return sendRedirect(event, '/sign-in?error=sso_failed')
  },
})
