import { getSamlInstance } from '../../../services/auth/saml.service'

export default defineEventHandler(async (event) => {
  const saml = getSamlInstance()
  const url = await saml.getAuthorizeUrlAsync('', getRequestHost(event), {})
  return sendRedirect(event, url)
})
