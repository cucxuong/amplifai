import { getSpMetadataXml, isSamlConfigured } from '../../../services/auth/saml.service'

export default defineEventHandler((event) => {
  if (!isSamlConfigured()) {
    throw createError({
      statusCode: 503,
      message: 'SAML metadata unavailable until IdP credentials are configured',
    })
  }

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return getSpMetadataXml()
})
