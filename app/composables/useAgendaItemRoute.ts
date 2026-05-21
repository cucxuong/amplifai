/** Resolve agenda item by route id after sessions are fetched. */
export function useAgendaItemRoute(id: MaybeRefOrGetter<string | undefined>) {
  const store = useAgendaStore()
  const resolvedId = computed(() => toValue(id))
  const item = ref<AgendaItem | null>(null)
  const ready = ref(false)

  watch(resolvedId, async (nextId) => {
    ready.value = false
    item.value = null
    if (!nextId)
      return

    if (!store.fetched)
      await store.fetchSessions()

    const found = store.items.find(i => i.id === nextId) ?? null
    item.value = found
    ready.value = true
  }, { immediate: true })

  return { item, ready, store }
}
