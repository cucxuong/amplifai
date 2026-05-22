import { isAuthBypassEnabled } from '../../services/auth/bypass'
import { findOrCreateDevMockUser } from '../../services/auth/sso.service'

interface AuthResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      displayName: string
    }
  }
  error?: string
}

export default defineEventHandler(async (event) => {
  if (!isAuthBypassEnabled()) {
    throw createError({
      statusCode: 403,
      message: 'Dev session is only available when NUXT_AUTH_BYPASS is enabled',
    })
  }

  try {
    // Get or create local mock user
    const mockUser = await findOrCreateDevMockUser()

    // Get the minisite backend URL
    const config = useRuntimeConfig()
    const minisiteBase = (config.minisiteApiBase as string).replace(/\/$/, '')

    // Default test password (8+ characters)
    const testPassword = 'test-password-123'

    console.log(`[Dev Session] Attempting to register user: ${mockUser.email}`)

    // Try to register the user
    let registerResponse: AuthResponse | null = null
    try {
      registerResponse = await $fetch<AuthResponse>(
        `${minisiteBase}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            password: testPassword,
          },
        },
      ).catch((err) => {
        // User might already exist - that's okay
        console.log(`[Dev Session] Register failed (probably user exists): ${err.statusCode}`)
        return null
      })
    }
    catch {
      // Handle any other registration errors
    }

    // If registration succeeded, use that token
    if (registerResponse?.success && registerResponse.data?.token) {
      console.log(`[Dev Session] User registered successfully: ${mockUser.email}`)

      const sessionPayload = {
        user: {
          email: registerResponse.data.user.email,
          name: registerResponse.data.user.displayName,
        },
        onboardingComplete: mockUser.onboardingComplete,
        personaId: mockUser.personaId,
        loggedInAt: Date.now(),
        minisiteToken: registerResponse.data.token,
      }

      console.log('[Dev Session] Setting user session (register path) with payload:', {
        email: sessionPayload.user.email,
        hasToken: !!sessionPayload.minisiteToken,
        tokenLength: sessionPayload.minisiteToken?.length,
      })

      try {
        await setUserSession(event, sessionPayload)
      }
      catch (sessionError) {
        console.error('[Dev Session] Failed to set user session (register):', sessionError)
        throw createError({
          statusCode: 500,
          message: `Failed to set user session: ${sessionError instanceof Error ? sessionError.message : 'Unknown error'}`,
        })
      }

      return {
        ok: true,
        user: {
          email: registerResponse.data.user.email,
          name: registerResponse.data.user.displayName,
        },
      }
    }

    // If registration failed (user exists), try to login
    console.log(`[Dev Session] User already exists, attempting login: ${mockUser.email}`)

    const loginResponse = await $fetch<AuthResponse>(
      `${minisiteBase}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          email: mockUser.email,
          password: testPassword,
        },
      },
    )

    if (!loginResponse.success || !loginResponse.data?.token) {
      console.error('[Dev Session] Login failed:', loginResponse.error)
      throw createError({
        statusCode: 401,
        message: `Authentication failed: ${loginResponse.error || 'Unknown error'}`,
      })
    }

    // Build session with token from login
    const sessionPayload = {
      user: {
        email: loginResponse.data.user.email,
        name: loginResponse.data.user.displayName,
      },
      onboardingComplete: mockUser.onboardingComplete,
      personaId: mockUser.personaId,
      loggedInAt: Date.now(),
      minisiteToken: loginResponse.data.token,
    }

    console.log('[Dev Session] Setting user session with payload:', {
      email: sessionPayload.user.email,
      hasToken: !!sessionPayload.minisiteToken,
      tokenLength: sessionPayload.minisiteToken?.length,
    })

    try {
      await setUserSession(event, sessionPayload)
    }
    catch (sessionError) {
      console.error('[Dev Session] Failed to set user session:', sessionError)
      throw createError({
        statusCode: 500,
        message: `Failed to set user session: ${sessionError instanceof Error ? sessionError.message : 'Unknown error'}`,
      })
    }

    console.log(`[Dev Session] User signed in: ${mockUser.email}`)

    return {
      ok: true,
      user: {
        email: loginResponse.data.user.email,
        name: loginResponse.data.user.displayName,
      },
    }
  }
  catch (error) {
    console.error('[Dev Session] Error:', error)

    // Check if it's already an H3 error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: `Failed to create dev session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
