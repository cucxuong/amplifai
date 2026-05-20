import {
  getLikelyNextPageBackgroundSrcs,
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

  const currentImageUrl = computed((): string | null => {
    const c = currentBackground.value
    return c.kind === 'image' ? toPageBackgroundUrl(img, c.src) : null
  })

  const bodyBackgroundStyle = computed(() => {
    const c = currentBackground.value
    if (c.kind === 'gradient')
      return `background: ${c.background};`
    return `background-image: url('${currentImageUrl.value}');`
  })

  const likelyNextBackgroundUrls = computed(() =>
    getLikelyNextPageBackgroundSrcs(route.path, pageBackgroundState.value)
      .map(src => toPageBackgroundUrl(img, src))
      .filter(href => href !== currentImageUrl.value),
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
      style: bodyBackgroundStyle.value,
    },
    link: [
      ...(currentImageUrl.value
        ? [{
            key: `page-bg-current-${currentImageUrl.value}`,
            rel: 'preload' as const,
            as: 'image' as const,
            href: currentImageUrl.value,
            fetchpriority: 'high' as const,
          }]
        : []),
      ...likelyNextBackgroundUrls.value.map(href => ({
        key: `page-bg-prefetch-${href}`,
        rel: 'prefetch' as const,
        as: 'image' as const,
        href,
      })),
    ],
  })))

  onMounted(() => {
    warmBackgrounds(allBackgroundUrls.value, currentImageUrl.value ?? undefined)
  })

  watch([currentImageUrl, likelyNextBackgroundUrls], ([current, likely]) => {
    warmBackgrounds(
      [...(current ? [current] : []), ...likely],
      current ?? undefined,
    )
  })

  watch(pageBackgroundState, () => {
    warmBackgrounds(
      [...(currentImageUrl.value ? [currentImageUrl.value] : []), ...likelyNextBackgroundUrls.value],
      currentImageUrl.value ?? undefined,
    )
  })

  router.beforeEach((to) => {
    const cfg = resolvePageBackground(to.path, pageBackgroundState.value)
    if (cfg.kind === 'image') {
      warmPageBackgroundUrl(
        toPageBackgroundUrl(img, cfg.src),
        'preload',
      )
    }
  })
}
