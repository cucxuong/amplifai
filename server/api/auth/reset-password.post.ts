import { authEndpointRemoved } from '../../utils/auth-endpoint-removed'

export default defineEventHandler(() => {
  authEndpointRemoved()
})
