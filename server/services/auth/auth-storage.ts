import { isAuthBypassEnabled } from './bypass'

const memoryStore = new Map<string, unknown>()

async function readItem<T>(key: string): Promise<T | null> {
  if (isAuthBypassEnabled()) {
    return (memoryStore.get(key) as T | undefined) ?? null
  }

  const storage = useStorage('data')
  return await storage.getItem<T>(key)
}

async function writeItem<T>(key: string, value: T): Promise<void> {
  if (isAuthBypassEnabled()) {
    memoryStore.set(key, value)
    return
  }

  const storage = useStorage('data')
  await storage.setItem(key, value)
}

export async function readAuthRecord<T>(key: string): Promise<T | null> {
  return await readItem<T>(key)
}

export async function writeAuthRecord<T>(key: string, value: T): Promise<void> {
  await writeItem(key, value)
}
