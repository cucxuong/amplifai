import { isAuthBypassEnabled } from './bypass'

const memoryStore = new Map<string, unknown>()

async function readItem<T>(key: string): Promise<T | null> {
  if (memoryStore.has(key))
    return (memoryStore.get(key) as T | undefined) ?? null

  if (isAuthBypassEnabled())
    return (memoryStore.get(key) as T | undefined) ?? null

  try {
    const storage = useStorage('data')
    return await storage.getItem<T>(key)
  }
  catch (err) {
    console.warn('[auth-storage] fs read failed, checking memory', key, err)
    return (memoryStore.get(key) as T | undefined) ?? null
  }
}

async function writeItem<T>(key: string, value: T): Promise<void> {
  if (isAuthBypassEnabled()) {
    memoryStore.set(key, value)
    return
  }

  try {
    const storage = useStorage('data')
    await storage.setItem(key, value)
  }
  catch (err) {
    console.warn('[auth-storage] fs write failed, using memory fallback', key, err)
    memoryStore.set(key, value)
  }
}

export async function readAuthRecord<T>(key: string): Promise<T | null> {
  return await readItem<T>(key)
}

export async function writeAuthRecord<T>(key: string, value: T): Promise<void> {
  await writeItem(key, value)
}
