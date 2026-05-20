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
    const base = [
      'background-size: cover',
      'background-repeat: no-repeat',
    ]
    if (c.kind === 'gradient') {
      return [
        ...base,
        `background-image: ${c.background}`,
        'background-position: center center',
      ].join('; ')
    }
    return [
      ...base,
      `background-image: url('${currentImageUrl.value}')`,
      'background-position: 30% 0%',
    ].join('; ')
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

  function applyBodyBackground() {
    if (!import.meta.client)
      return
    document.body.setAttribute('style', bodyBackgroundStyle.value)
  }

  useHead(computed(() => ({
    bodyAttrs: {
      style: bodyBackgroundStyle.value,
      'data-page-bg': route.path,
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

  watch(bodyBackgroundStyle, applyBodyBackground, { immediate: true })

  onMounted(() => {
    applyBodyBackground()
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
