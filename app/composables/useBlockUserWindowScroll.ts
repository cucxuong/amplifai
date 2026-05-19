/** Block user-driven window scroll via overflow on html/body. */
export function useBlockUserWindowScroll() {
  if (!import.meta.client)
    return

  const html = document.documentElement
  const body = document.body
  const prevHtmlOverflow = html.style.overflow
  const prevBodyOverflow = body.style.overflow

  html.style.overflow = 'hidden'
  body.style.overflow = 'hidden'

  onScopeDispose(() => {
    html.style.overflow = prevHtmlOverflow
    body.style.overflow = prevBodyOverflow
  })
}
