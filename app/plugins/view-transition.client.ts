export default defineNuxtPlugin((nuxtApp) => {
  const vtActive = useState('viewTransitionActive', () => false)
  const pendingBodyBg = useState<string | null>('pendingBodyBg', () => null)

  nuxtApp.hook('page:view-transition:start', (transition) => {
    vtActive.value = true

    transition.finished.finally(() => {
      vtActive.value = false
      pendingBodyBg.value = null
    })
  })

  if (!document.startViewTransition) {
    nuxtApp.hook('app:mounted', () => {
      vtActive.value = false
    })
  }
})
