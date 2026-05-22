/**
 * Dev-only mock SAML assertion handler
 * Registers/logs in user on real backend and gets real token
 */

import { mapSamlProfileToClaims } from '../../../services/auth/sso.service'
import { findOrCreateSamlUser } from '../../../services/auth/sso.service'

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

interface MockSamlRequest {
  email: string
  firstName: string
  lastName: string
}

export default defineEventHandler(async (event) => {
  // Only allow in development
  if (!import.meta.dev) {
    throw createError({
      statusCode: 404,
      message: 'Mock SAML endpoint is only available in development',
    })
  }

  const body = await readBody<Partial<MockSamlRequest>>(event)

  // Validate request
  const email = body.email?.trim()
  const firstName = body.firstName?.trim() || 'Dev'
  const lastName = body.lastName?.trim() || 'User'

  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      message: 'Valid email is required',
    })
  }

  // Ensure @loreal.com domain
  if (!email.endsWith('@loreal.com')) {
    throw createError({
      statusCode: 400,
      message: 'Email must be @loreal.com domain',
    })
  }

  try {
    // Step 1: Create/update local user record
    const mockProfile = {
      nameID: `dev-mock-${Date.now()}`,
      email,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname': firstName,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname': lastName,
    }

    const claims = mapSamlProfileToClaims(mockProfile)
    const stored = await findOrCreateSamlUser(claims)

    // Step 2: Register or login on backend
    const config = useRuntimeConfig()
    const minisiteBase = (config.minisiteApiBase as string).replace(/\/$/, '')
    const testPassword = 'test-password-123'

    console.log(`[Mock SAML] Attempting to register user: ${email}`)

    // Try to register
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
            email: stored.email,
            firstName: stored.firstName,
            lastName: stored.lastName,
            password: testPassword,
          },
        },
      ).catch(() => null)
    }
    catch {
      // Ignore registration errors
    }

    // If registration succeeded, use that token
    if (registerResponse?.success && registerResponse.data?.token) {
      console.log(`[Mock SAML] User registered: ${email}`)

      const sessionPayload = {
        user: {
          email: registerResponse.data.user.email,
          name: registerResponse.data.user.displayName,
        },
        onboardingComplete: stored.onboardingComplete,
        personaId: stored.personaId,
        loggedInAt: Date.now(),
        minisiteToken: registerResponse.data.token,
      }

      console.log('[Mock SAML] Setting user session (register path) with payload:', {
        email: sessionPayload.user.email,
        hasToken: !!sessionPayload.minisiteToken,
        tokenLength: sessionPayload.minisiteToken?.length,
      })

      try {
        await setUserSession(event, sessionPayload)
      }
      catch (sessionError) {
        console.error('[Mock SAML] Failed to set user session (register):', sessionError)
        return sendRedirect(event, `/sign-in?error=session_failed&message=${encodeURIComponent('Failed to create session during registration')}`)
      }

      return {
        ok: true,
        message: 'Registered and signed in',
        user: {
          email: registerResponse.data.user.email,
          name: registerResponse.data.user.displayName,
        },
      }
    }

    // If registration failed, try to login
    console.log(`[Mock SAML] User already exists, attempting login: ${email}`)

    const loginResponse = await $fetch<AuthResponse>(
      `${minisiteBase}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          email: stored.email,
          password: testPassword,
        },
      },
    )

    if (!loginResponse.success || !loginResponse.data?.token) {
      console.error('[Mock SAML] Login failed:', loginResponse.error)
      throw createError({
        statusCode: 401,
        message: 'Authentication failed',
      })
    }

    const sessionPayload = {
      user: {
        email: loginResponse.data.user.email,
        name: loginResponse.data.user.displayName,
      },
      onboardingComplete: stored.onboardingComplete,
      personaId: stored.personaId,
      loggedInAt: Date.now(),
      minisiteToken: loginResponse.data.token,
    }

    console.log('[Mock SAML] Setting user session with payload:', {
      email: sessionPayload.user.email,
      hasToken: !!sessionPayload.minisiteToken,
      tokenLength: sessionPayload.minisiteToken?.length,
    })

    try {
      await setUserSession(event, sessionPayload)
    }
    catch (sessionError) {
      console.error('[Mock SAML] Failed to set user session:', sessionError)
      return sendRedirect(event, `/sign-in?error=session_failed&message=${encodeURIComponent('Failed to create session')}`)
    }

    console.log(`[Mock SAML] User signed in: ${email}`)

    return {
      ok: true,
      message: 'Signed in successfully',
      user: {
        email: loginResponse.data.user.email,
        name: loginResponse.data.user.displayName,
      },
    }
  }
  catch (err) {
    console.error('[Mock SAML] Error:', err)
    const statusCode = err && typeof err === 'object' && 'statusCode' in err ? (err as any).statusCode : 401
    const message = err && typeof err === 'object' && 'message' in err ? (err as any).message : 'Mock SAML failed'

    return sendRedirect(event, `/sign-in?error=mock_saml_failed&message=${encodeURIComponent(message)}`)
  }
})
