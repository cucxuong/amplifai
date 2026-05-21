import { findOrCreateSsoUser } from '../../services/auth/sso.service'
import { buildAuthSessionPayload } from '../../services/auth/users.store'

export default defineOAuthMicrosoftEventHandler({
  async onSuccess(event, { user }) {
    const stored = await findOrCreateSsoUser(user)
    await setUserSession(event, buildAuthSessionPayload(stored))
    return sendRedirect(event, '/')
  },
  onError(event) {
    return sendRedirect(event, '/sign-in?error=sso_failed')
  },
})
