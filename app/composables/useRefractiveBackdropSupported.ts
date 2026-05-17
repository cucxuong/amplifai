/**
 * SVG url() in backdrop-filter works in Chromium; HASH documents gaps elsewhere.
 */
export function useRefractiveBackdropSupported() {
  return computed(() => {
    if (!import.meta.client || typeof navigator === 'undefined')
      return false
    const ua = navigator.userAgent
    if (/firefox\//i.test(ua))
      return false
    const isIOS = /iPad|iPhone|iPod/.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (isIOS)
      return false
    if (/safari/i.test(ua) && !/chrome|crios|fxios|edg|opr\//i.test(ua))
      return false
    return /Chrome|Chromium|Edg|OPR|SamsungBrowser/i.test(ua)
  })
}
