import crypto from 'node:crypto'

/**
 * Cloudflare Workers' node:crypto returns Verify/Sign/Hash/Hmac objects whose
 * prototype chain is missing EventEmitter methods (removeAllListeners, on, emit, …).
 * xml-crypto (via @node-saml/node-saml) crashes on `this.removeAllListeners is not a function`.
 * Patch the prototypes once at boot.
 */
export default defineNitroPlugin(() => {
  const noopChain = function (this: unknown) { return this }
  const stubs: Record<string, (...args: unknown[]) => unknown> = {
    removeAllListeners: noopChain,
    on: noopChain,
    once: noopChain,
    off: noopChain,
    addListener: noopChain,
    removeListener: noopChain,
    prependListener: noopChain,
    prependOnceListener: noopChain,
    setMaxListeners: noopChain,
    emit: () => false,
    listenerCount: () => 0,
    listeners: () => [],
    rawListeners: () => [],
    eventNames: () => [],
    getMaxListeners: () => 10,
  }

  const samples: unknown[] = []
  try { samples.push(crypto.createVerify('sha256')) } catch { /* ignore */ }
  try { samples.push(crypto.createSign('sha256')) } catch { /* ignore */ }
  try { samples.push(crypto.createHash('sha256')) } catch { /* ignore */ }
  try { samples.push(crypto.createHmac('sha256', 'k')) } catch { /* ignore */ }

  for (const sample of samples) {
    if (!sample) continue
    const proto = Object.getPrototypeOf(sample) as Record<string, unknown> | null
    if (!proto) continue
    for (const [name, fn] of Object.entries(stubs)) {
      if (typeof proto[name] !== 'function') {
        try {
          Object.defineProperty(proto, name, { value: fn, configurable: true, writable: true })
        }
        catch { /* prototype frozen; skip */ }
      }
    }
  }
})
