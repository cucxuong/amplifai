/**
 * Simple token generation for mock sessions (without external dependencies)
 * Uses basic Base64 encoding for dev - not production secure!
 */

import crypto from 'crypto'

export interface TokenPayload {
  email: string
  iat: number
  exp: number
}

/**
 * Generate a simple mock token (simulates Minisite backend token)
 * Format: base64(email.timestamp.random)
 *
 * For production, use real JWT with jsonwebtoken package
 */
export function generateMockToken(email: string, expiresInHours = 168): string {
  const iat = Math.floor(Date.now() / 1000) // Current time in seconds
  const exp = iat + (expiresInHours * 3600) // Expiry time in seconds
  const randomSuffix = crypto.randomBytes(8).toString('hex')

  // Create a simple token: base64(email:iat:exp:random)
  const tokenData = `${email}:${iat}:${exp}:${randomSuffix}`
  return Buffer.from(tokenData).toString('base64')
}

/**
 * Verify and decode a token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [email, iatStr, expStr] = decoded.split(':')

    if (!email || !iatStr || !expStr) {
      return null
    }

    const iat = parseInt(iatStr, 10)
    const exp = parseInt(expStr, 10)
    const now = Math.floor(Date.now() / 1000)

    // Check if expired
    if (now > exp) {
      return null
    }

    return { email, iat, exp }
  }
  catch {
    return null
  }
}

/**
 * Check if token is still valid
 */
export function isTokenValid(token: string): boolean {
  const decoded = verifyToken(token)
  return decoded !== null
}
