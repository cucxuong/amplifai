import crypto from 'node:crypto'
import { EventEmitter } from 'node:events'
// xml2js is shipped as CommonJS; default import is the module namespace
// @ts-expect-error - no types needed, we only touch the Parser prototype
import xml2js from 'xml2js'

/**
 * Cloudflare Workers' nodejs_compat exposes node:crypto and node:events, but the
 * objects they return (Verify/Sign/Hash, and any class extending the un-prefixed
 * `events` module) ship with incomplete prototypes — `removeAllListeners`, `on`,
 * `emit` etc. are missing. xml-crypto and xml2js both crash on
 * `this.removeAllListeners is not a function`. Patch the prototypes once at boot.
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

  // xml2js.Parser inherits from `require('events')` which on CF Workers resolves
  // separately from `node:events`. Patch the Parser prototype directly so we don't
  // depend on which EventEmitter implementation it sees.
  try {
    const Parser = (xml2js as { Parser?: { prototype: unknown } })?.Parser
    if (Parser?.prototype) protos.push(Parser.prototype)
  }
  catch { /* xml2js shape unexpected; skip */ }

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
