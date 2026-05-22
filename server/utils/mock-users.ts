/**
 * Dev-only mock user presets for testing different scenarios
 */

export interface MockUserPreset {
  email: string
  firstName: string
  lastName: string
  personaId?: string | null
  description: string
}

export const MOCK_USER_PRESETS = {
  dev: {
    email: 'dev.user@loreal.com',
    firstName: 'Dev',
    lastName: 'User',
    personaId: null,
    description: 'Default dev user (no onboarding)',
  },
  innovator: {
    email: 'innovator.test@loreal.com',
    firstName: 'Isabella',
    lastName: 'Innovator',
    personaId: 'innovator',
    description: 'Innovator persona (onboarding complete)',
  },
  explorer: {
    email: 'explorer.test@loreal.com',
    firstName: 'Emily',
    lastName: 'Explorer',
    personaId: 'explorer',
    description: 'Explorer persona (onboarding complete)',
  },
  connector: {
    email: 'connector.test@loreal.com',
    firstName: 'Christopher',
    lastName: 'Connector',
    personaId: 'connector',
    description: 'Connector persona (onboarding complete)',
  },
  performer: {
    email: 'performer.test@loreal.com',
    firstName: 'Priya',
    lastName: 'Performer',
    personaId: 'performer',
    description: 'Performer persona (onboarding complete)',
  },
} as const

export type MockUserPresetKey = keyof typeof MOCK_USER_PRESETS

export function getMockUserPreset(key: string = 'dev'): MockUserPreset | null {
  const preset = MOCK_USER_PRESETS[key as MockUserPresetKey]
  return preset || null
}

export function getAllMockUserPresets(): Array<{ key: MockUserPresetKey, preset: MockUserPreset }> {
  return Object.entries(MOCK_USER_PRESETS).map(([key, preset]) => ({
    key: key as MockUserPresetKey,
    preset,
  }))
}
