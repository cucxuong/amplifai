const DEFAULT_MIN_SCROLL_TOP = 62

export function getMinScrollTop(): number {
  if (import.meta.server)
    return DEFAULT_MIN_SCROLL_TOP

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--app-min-scroll-top')
    .trim()

  return Number.parseFloat(raw) || DEFAULT_MIN_SCROLL_TOP
}

/** Sync window scroll to --app-min-scroll-top (Safari full-bleed hack). */
export function pinScrollSync(): number {
  const top = getMinScrollTop()
  window.scrollTo({ top, left: 0, behavior: 'instant' })
  document.documentElement.classList.add('app-scroll-pinned')
  return top
}
