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
    if (c.kind === 'solid') {
      return [
        'background-image: none',
        `background-color: ${c.color}`,
      ].join('; ')
    }
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

  const vtActive = useState('viewTransitionActive', () => false)
  const pendingBodyBg = useState<string | null>('pendingBodyBg', () => null)
  const displayedBodyStyle = ref('')
  let lastBackgroundKey = ''

  function backgroundKey(bg: ReturnType<typeof resolvePageBackground>) {
    if (bg.kind === 'solid') return `solid:${bg.color}`
    if (bg.kind === 'gradient') return `gradient:${bg.background}`
    return `image:${bg.src}`
  }

  function commitBodyBackground(style: string, key: string) {
    lastBackgroundKey = key
    displayedBodyStyle.value = style
    if (import.meta.client)
      document.body.setAttribute('style', style)
  }

  function applyBodyBackground() {
    const style = bodyBackgroundStyle.value
    const key = backgroundKey(currentBackground.value)

    if (key === lastBackgroundKey)
      return

    if (import.meta.client && vtActive.value) {
      pendingBodyBg.value = style
      return
    }

    commitBodyBackground(style, key)
  }

  useHead(computed(() => ({
    bodyAttrs: {
      style: displayedBodyStyle.value || bodyBackgroundStyle.value,
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

  watch(vtActive, (active, wasActive) => {
    if (wasActive && !active && pendingBodyBg.value) {
      const style = pendingBodyBg.value
      pendingBodyBg.value = null
      const key = backgroundKey(currentBackground.value)
      commitBodyBackground(style, key)
    }
  })

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
