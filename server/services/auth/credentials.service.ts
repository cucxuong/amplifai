export interface RegisterInput {
  email: string
  password: string
}

/** Placeholder: password registration not implemented yet. */
export async function register(_input: RegisterInput): Promise<never> {
  throw createError({
    statusCode: 501,
    message: 'Registration with password is not implemented yet',
  })
}

/** Placeholder: password verification not implemented yet. */
export async function verifyPassword(_email: string, _password: string): Promise<boolean> {
  throw createError({
    statusCode: 501,
    message: 'Password verification is not implemented yet',
  })
}
