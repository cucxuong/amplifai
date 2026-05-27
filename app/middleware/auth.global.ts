const PUBLIC_PREFIXES = ['/sign-in', '/privacy']
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (to.path === '/pick-persona' || to.path.startsWith('/pick-persona/')) {
    if (!loggedIn.value)
      return navigateTo('/sign-in')
    return
  }

  const AUTH_HOME = '/agenda'
  const isPublic = to.path === '/'
    || PUBLIC_PREFIXES.some(
      prefix => to.path === prefix || to.path.startsWith(`${prefix}/`),
    )

  if (loggedIn.value) {
    if (to.path.startsWith('/sign-in'))
      return navigateTo(AUTH_HOME)
    return
  }

  if (!isPublic)
    return navigateTo('/sign-in')
})
