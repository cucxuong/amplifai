import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

export function useAppBack(fallback: MaybeRefOrGetter<string> = '/agenda') {
  const router = useRouter()

  function goBack() {
    const intent = useState<'forward' | 'back' | null>('navigationIntent', () => null)
    intent.value = 'back'

    if (import.meta.client && window.history.length > 1)
      router.back()
    else
      navigateTo(toValue(fallback))
  }

  return { goBack }
}
