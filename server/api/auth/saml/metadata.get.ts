import { getSamlInstance } from '../../../services/auth/saml.service'

export default defineEventHandler((event) => {
  const saml = getSamlInstance()
  const xml = saml.generateServiceProviderMetadata(null, null)
  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
