const PUBLIC_PREFIXES = ['/', '/sign-in', '/sign-up']
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (to.path === '/pick-persona' || to.path.startsWith('/pick-persona/')) {
    if (!loggedIn.value)
      return navigateTo('/sign-in')
    return
  }

  const AUTH_HOME = '/agenda'
  const isPublic = PUBLIC_PREFIXES.some(
    p => to.path === p || to.path.startsWith(`${p}/`),
  )

  if (loggedIn.value) {
    if (to.path.startsWith('/sign-in') || to.path.startsWith('/sign-up'))
      return navigateTo(AUTH_HOME)
    return
  }

  if (!isPublic)
    return navigateTo('/sign-in')
})
