export const GIFT_PAGE_ENTER_STATE_KEY = 'gift-page-enter-complete'

export function setGiftPageEnterComplete(complete: boolean) {
  useState(GIFT_PAGE_ENTER_STATE_KEY, () => false).value = complete
}

export function useGiftPageEnterComplete() {
  return useState(GIFT_PAGE_ENTER_STATE_KEY, () => false)
}
