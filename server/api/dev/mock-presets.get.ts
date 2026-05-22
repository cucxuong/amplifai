/**
 * Dev-only endpoint to list available mock SSO user presets
 */

import { getAllMockUserPresets } from '../../utils/mock-users'

export default defineEventHandler((event) => {
  // Only allow in development
  if (!import.meta.dev) {
    throw createError({
      statusCode: 404,
      message: 'Mock presets endpoint is only available in development',
    })
  }

  const presets = Object.fromEntries(
    getAllMockUserPresets().map(({ key, preset }) => [key, preset]),
  )

  return {
    presets,
  }
})
