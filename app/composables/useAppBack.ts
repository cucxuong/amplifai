import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

export function useAppBack(fallback: MaybeRefOrGetter<string> = '/agenda') {
  const router = useRouter()
  const { setBackIntent } = useNavigationIntent()

  function goBack() {
    setBackIntent()

    if (import.meta.client && window.history.length > 1)
      router.back()
    else
      navigateTo(toValue(fallback))
  }

  return { goBack }
}
