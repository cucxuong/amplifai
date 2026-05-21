import {
  backgroundConfigKey,
  bodyBackgroundPropsToStyle,
  getAllPageBackgroundImageUrls,
  preloadAllPageBackgroundImages,
  resolvePageBackground,
  toBodyBackgroundProps,
  type BodyBackgroundProps,
  toRawPageBackgroundUrl,
} from '~/utils/page-backgrounds'

const BODY_BG_PROP_KEYS: (keyof BodyBackgroundProps)[] = [
  'backgroundImage',
  'backgroundSize',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundColor',
]

function camelToKebab(prop: string): string {
  return prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
}

function applyBodyBackgroundProps(props: BodyBackgroundProps) {
  const body = document.body

  for (const key of BODY_BG_PROP_KEYS)
    body.style.setProperty(camelToKebab(key), props[key])
}

export function usePageBodyBackground() {
  const route = useRoute()
  const { loggedIn, session } = useUserSession()

  const pageBackgroundState = computed(() => ({
    loggedIn: loggedIn.value,
    onboardingComplete: Boolean(session.value?.onboardingComplete),
  }))

  const currentBackground = computed(() =>
    resolvePageBackground(route.path, pageBackgroundState.value),
  )

  const backgroundKey = computed(() =>
    backgroundConfigKey(currentBackground.value),
  )

  const currentImageUrl = computed((): string | null => {
    const c = currentBackground.value
    return c.kind === 'image' ? toRawPageBackgroundUrl(c.src) : null
  })

  const bodyBackgroundProps = computed(() =>
    toBodyBackgroundProps(currentBackground.value, currentImageUrl.value),
  )

  const bodyBackgroundStyle = computed(() =>
    bodyBackgroundPropsToStyle(bodyBackgroundProps.value),
  )

  const allBackgroundUrls = getAllPageBackgroundImageUrls()

  function applyBackground() {
    if (!import.meta.client)
      return

    applyBodyBackgroundProps(bodyBackgroundProps.value)
  }

  if (import.meta.client)
    preloadAllPageBackgroundImages()

  useHead(computed(() => ({
    bodyAttrs: {
      style: bodyBackgroundStyle.value,
      'data-page-bg': route.path,
    },
    link: allBackgroundUrls.map(href => ({
      key: `page-bg-preload-${href}`,
      rel: 'preload' as const,
      as: 'image' as const,
      href,
      ...(href === currentImageUrl.value
        ? { fetchpriority: 'high' as const }
        : {}),
    })),
  })))

  watch(
    [() => route.fullPath, pageBackgroundState, backgroundKey, bodyBackgroundProps],
    applyBackground,
    { immediate: true, deep: true },
  )

  onMounted(() => {
    preloadAllPageBackgroundImages()
    applyBackground()
  })
}
