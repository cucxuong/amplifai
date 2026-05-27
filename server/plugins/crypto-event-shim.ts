import crypto from 'node:crypto'
import { EventEmitter } from 'node:events'

/**
 * Cloudflare Workers' nodejs_compat exposes node:crypto and node:events, but the
 * Verify/Sign/Hash objects (and in some cases EventEmitter itself) ship with
 * incomplete prototypes — `removeAllListeners`, `on`, `emit` etc. are missing.
 * xml-crypto and xml2js both crash on `this.removeAllListeners is not a function`.
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

  const protos: unknown[] = [EventEmitter?.prototype]
  try { protos.push(Object.getPrototypeOf(new EventEmitter())) } catch { /* ignore */ }
  try { protos.push(Object.getPrototypeOf(crypto.createVerify('sha256'))) } catch { /* ignore */ }
  try { protos.push(Object.getPrototypeOf(crypto.createSign('sha256'))) } catch { /* ignore */ }
  try { protos.push(Object.getPrototypeOf(crypto.createHash('sha256'))) } catch { /* ignore */ }
  try { protos.push(Object.getPrototypeOf(crypto.createHmac('sha256', 'k'))) } catch { /* ignore */ }

  const seen = new Set<unknown>()
  for (const proto of protos) {
    if (!proto || seen.has(proto)) continue
    seen.add(proto)
    const p = proto as Record<string, unknown>
    for (const [name, fn] of Object.entries(stubs)) {
      if (typeof p[name] !== 'function') {
        try {
          Object.defineProperty(p, name, { value: fn, configurable: true, writable: true })
        }
        catch { /* prototype frozen; skip */ }
      }
    }
  }
})
