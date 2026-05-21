import type { NavigationIntent, PageTransitionName } from '~/utils/route-transition'

export function useNavigationIntent() {
  const navigationIntent = useState<NavigationIntent>('navigationIntent', () => null)

  function setForwardIntent() {
    navigationIntent.value = 'forward'
  }

  function setBackIntent() {
    navigationIntent.value = 'back'
  }

  async function navigateForward(to: Parameters<typeof navigateTo>[0]) {
    setForwardIntent()
    return navigateTo(to)
  }

  return {
    navigationIntent,
    setForwardIntent,
    setBackIntent,
    navigateForward,
  }
}

export function usePageTransitionName() {
  return useState<PageTransitionName>('pageTransitionName', () => 'agenda-scale')
}
