const PUBLIC_PREFIXES = ['/', '/sign-in']
const AUTH_HOME = '/'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/pick-persona' || to.path.startsWith('/pick-persona/'))
    return navigateTo('/')

  const { loggedIn } = useUserSession()
  const isPublic = PUBLIC_PREFIXES.some(
    p => to.path === p || to.path.startsWith(`${p}/`),
  )

  if (loggedIn.value) {
    if (to.path.startsWith('/sign-in'))
      return navigateTo(AUTH_HOME)
    return
  }

  if (!isPublic)
    return navigateTo('/sign-in')
})
