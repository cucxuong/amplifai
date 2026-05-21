/**
 * Do not set overflow:hidden on html/body — Safari clips body background bleed.
 * Window scroll is pinned to --app-min-scroll-top in app.vue; overscroll-none on html/body.
 */
export function useBlockUserWindowScroll() {
}
