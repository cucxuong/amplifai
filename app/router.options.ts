import type { RouterConfig } from '@nuxt/schema'
import { getMinScrollTop } from '~/utils/app-scroll-pin'

export default {
  scrollBehavior(to, _from, _savedPosition) {
    const top = getMinScrollTop()

    if (to.hash) {
      return {
        el: to.hash,
        top,
        behavior: 'instant',
      }
    }

    return { top, left: 0, behavior: 'instant' }
  },
} satisfies RouterConfig
