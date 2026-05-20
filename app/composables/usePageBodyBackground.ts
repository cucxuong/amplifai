import {
  getLikelyNextPageBackgroundSrcs,
  PAGE_BG_MODIFIERS,
  PAGE_BG_SOURCES,
  resolvePageBackground,
  toPageBackgroundUrl,
  warmPageBackgroundUrl,
} from '~/utils/page-backgrounds'

export function usePageBodyBackground() {
  const img = useImage()
  const route = useRoute()
  const router = useRouter()
  const { loggedIn, session } = useUserSession()

  const pageBackgroundState = computed(() => ({
    loggedIn: loggedIn.value,
    onboardingComplete: Boolean(session.value?.onboardingComplete),
  }))

  const currentBackground = computed(() =>
    resolvePageBackground(route.path, pageBackgroundState.value),
  )

  const currentBackgroundUrl = computed(() =>
    toPageBackgroundUrl(img, currentBackground.value.src),
  )

  const likelyNextBackgroundUrls = computed(() =>
    getLikelyNextPageBackgroundSrcs(route.path, pageBackgroundState.value)
      .map(src => toPageBackgroundUrl(img, src))
      .filter(href => href !== currentBackgroundUrl.value),
  )

  const allBackgroundUrls = computed(() =>
    PAGE_BG_SOURCES.map(src => toPageBackgroundUrl(img, src)),
  )

  function warmBackgrounds(
    urls: string[],
    currentHref?: string,
  ) {
    if (!import.meta.client)
      return

    for (const href of urls) {
      warmPageBackgroundUrl(
        href,
        href === currentHref ? 'preload' : 'prefetch',
      )
    }
  }

  useHead(computed(() => ({
    bodyAttrs: {
      style: `background-image: url('${currentBackgroundUrl.value}');`,
    },
    link: [
      {
        key: `page-bg-current-${currentBackgroundUrl.value}`,
        rel: 'preload',
        as: 'image',
        href: currentBackgroundUrl.value,
        fetchpriority: 'high',
      },
      ...likelyNextBackgroundUrls.value.map(href => ({
        key: `page-bg-prefetch-${href}`,
        rel: 'prefetch',
        as: 'image',
        href,
      })),
    ],
  })))

  onMounted(() => {
    warmBackgrounds(allBackgroundUrls.value, currentBackgroundUrl.value)
  })

  watch([currentBackgroundUrl, likelyNextBackgroundUrls], ([current, likely]) => {
    warmBackgrounds([current, ...likely], current)
  })

  watch(pageBackgroundState, () => {
    warmBackgrounds(
      [currentBackgroundUrl.value, ...likelyNextBackgroundUrls.value],
      currentBackgroundUrl.value,
    )
  })

  router.beforeEach((to) => {
    const { src } = resolvePageBackground(to.path, pageBackgroundState.value)
    warmPageBackgroundUrl(
      toPageBackgroundUrl(img, src),
      'preload',
    )
  })
}
