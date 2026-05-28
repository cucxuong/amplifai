import { SAML } from '@node-saml/node-saml'

let _saml: SAML | null = null

function normalizeCert(cert: string): string {
  return cert.replace(/\\n/g, '\n').trim()
}

export function getSamlInstance(): SAML {
  if (_saml) return _saml
  const config = useRuntimeConfig()
  const idpSsoUrl = config.samlIdpSsoUrl as string
  const idpCert = config.samlIdpCert as string

  if (!idpSsoUrl || !idpCert) {
    throw createError({ statusCode: 503, message: 'SAML SSO is not configured — set NUXT_SAML_IDP_SSO_URL and NUXT_SAML_IDP_CERT' })
  }

  _saml = new SAML({
    callbackUrl: config.samlAcsUrl as string,
    entryPoint: idpSsoUrl,
    issuer: config.samlEntityId as string,
    idpCert: normalizeCert(idpCert),
    disableRequestedAuthnContext: Boolean(config.samlDisableRequestedAuthnContext),
    forceAuthn: Boolean(config.samlForceAuthn),
    wantAuthnResponseSigned: false,
  })

  return _saml
}

export interface SamlProfile {
  email: string
  firstName: string
  lastName: string
  nameId: string
}

export function extractSamlProfile(profile: Record<string, unknown>): SamlProfile {
  const nameID = (profile.nameID as string) ?? ''
  const email = (
    (profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] as string)
    || (profile['http://schemas.microsoft.com/identity/claims/upn'] as string)
    || nameID
  ).toLowerCase().trim()

  const firstName = (profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] as string) ?? ''
  const lastName = (profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] as string) ?? ''

  return { email, firstName, lastName, nameId: nameID }
}
