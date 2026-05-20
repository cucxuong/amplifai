/** Refresh session after auth API calls that set cookies. */
export async function refreshAuthSession(): Promise<boolean> {
  const { fetch, loggedIn } = useUserSession()
  await fetch()
  return loggedIn.value
}
