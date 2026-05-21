import { resolvePageTransition, type PageTransitionName } from '~/utils/route-transition'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const pageTransitionName = useState<PageTransitionName>('pageTransitionName', () => 'agenda-scale')
  const navigationIntent = useState<'forward' | 'back' | null>('navigationIntent', () => null)

  router.beforeEach((to, from) => {
    if (to.path === from.path)
      return

    pageTransitionName.value = resolvePageTransition(
      from.path,
      to.path,
      navigationIntent.value,
    )
    navigationIntent.value = null
  })
})
