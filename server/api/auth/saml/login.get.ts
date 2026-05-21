import { createLoginRedirectUrl, isSamlConfigured } from '../../../services/auth/saml.service'

export default defineEventHandler(async (event) => {
  if (!isSamlConfigured())
    return sendRedirect(event, '/sign-in?error=sso_not_configured')

  const relayState = getQuery(event).RelayState
  const relay = typeof relayState === 'string' ? relayState : ''

  try {
    const url = await createLoginRedirectUrl(relay)
    return sendRedirect(event, url)
  }
  catch {
    return sendRedirect(event, '/sign-in?error=sso_failed')
  }
})
