import { SAML, type Profile, type SamlConfig } from '@node-saml/node-saml'

const DEFAULT_ENTITY_ID = 'https://amplifaiweek.loreal.sg'

export interface SamlRuntimeConfig {
  entityId: string
  acsUrl: string
  idpSsoUrl: string
  idpCert: string
}

function normalizePem(cert: string): string {
  return cert.replace(/\\n/g, '\n').trim()
}

export function getSamlRuntimeConfig(): SamlRuntimeConfig {
  const config = useRuntimeConfig()
  const entityId = config.saml?.entityId?.trim() || DEFAULT_ENTITY_ID
  const acsUrl = config.saml?.acsUrl?.trim() || `${entityId}/api/auth/saml/acs`

  return {
    entityId,
    acsUrl,
    idpSsoUrl: config.saml?.idpSsoUrl?.trim() || '',
    idpCert: normalizePem(config.saml?.idpCert || ''),
  }
}

export function isSamlConfigured(): boolean {
  const { idpSsoUrl, idpCert } = getSamlRuntimeConfig()
  return Boolean(idpSsoUrl && idpCert)
}

function buildSamlOptions(): SamlConfig {
  const { entityId, acsUrl, idpSsoUrl, idpCert } = getSamlRuntimeConfig()

  if (!idpSsoUrl || !idpCert) {
    throw createError({
      statusCode: 503,
      message: 'SAML is not configured. Contact IT or enable NUXT_AUTH_BYPASS for dev.',
    })
  }

  return {
    callbackUrl: acsUrl,
    entryPoint: idpSsoUrl,
    issuer: entityId,
    idpCert,
    audience: entityId,
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: false,
  }
}

export function createSamlClient(): SAML {
  return new SAML(buildSamlOptions())
}

export async function createLoginRedirectUrl(relayState = ''): Promise<string> {
  const saml = createSamlClient()
  return saml.getAuthorizeUrlAsync(relayState, undefined, {})
}

export async function parseAcsResponse(body: Record<string, unknown>): Promise<Profile> {
  const samlResponse = typeof body.SAMLResponse === 'string' ? body.SAMLResponse : ''
  if (!samlResponse) {
    throw createError({ statusCode: 400, message: 'SAMLResponse is missing' })
  }

  const saml = createSamlClient()
  const { profile } = await saml.validatePostResponseAsync({ SAMLResponse: samlResponse })
  if (!profile) {
    throw createError({ statusCode: 401, message: 'SAML profile is missing' })
  }
  return profile
}

export function getSpMetadataXml(): string {
  const saml = createSamlClient()
  return saml.generateServiceProviderMetadata(null, null)
}
