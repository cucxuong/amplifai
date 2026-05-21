declare module '#auth-utils' {
  interface User {
    email: string
    name?: string
  }

  interface UserSession {
    personaId?: string | null
    onboardingComplete?: boolean
    minisiteToken?: string
    minisiteUserId?: string
  }
}

export {}
