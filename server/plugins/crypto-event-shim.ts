import crypto from 'node:crypto'
import { EventEmitter } from 'node:events'
// xml2js is shipped as CommonJS; default import is the module namespace
// @ts-expect-error - no types needed, we only touch the Parser prototype
import xml2js from 'xml2js'

/**
 * Cloudflare Workers' nodejs_compat has two gaps that break @node-saml/node-saml:
 *
 *   1. crypto.createVerify/Sign/Hash returned objects lack EventEmitter methods
 *      (removeAllListeners, on, …). xml-crypto only calls .update()/.verify() on
 *      these — it never relies on real event behavior — so noop stubs are safe.
 *
 *   2. xml2js.Parser extends `require('events')` which on CF Workers resolves to
 *      an EventEmitter whose prototype chain is broken (members missing). Unlike
 *      the crypto case, xml2js *does* depend on real event behavior — it wires
 *      up its result via `this.on('end', …)` and `this.emit('end', result)`. A
 *      noop here causes the worker to hang waiting for the parse to resolve.
 *
 * For xml2js.Parser we copy the methods from a *working* EventEmitter (the one
 * we get via `node:events`) onto Parser.prototype. The crypto prototypes keep
 * cheap noop stubs.
 */
export default defineNitroPlugin(() => {
  const noopChain = function (this: unknown) { return this }
  const noopStubs: Record<string, (...args: unknown[]) => unknown> = {
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

  function patchWithStubs(proto: unknown) {
    if (!proto) return
    const p = proto as Record<string, unknown>
    for (const [name, fn] of Object.entries(noopStubs)) {
      if (typeof p[name] !== 'function') {
        try { Object.defineProperty(p, name, { value: fn, configurable: true, writable: true }) }
        catch { /* frozen */ }
      }
    }
  }

  // Copy real EventEmitter prototype methods (the working ones from node:events)
  // onto the target prototype. Used for xml2js.Parser which needs real event semantics.
  function implantEventEmitter(proto: unknown) {
    if (!proto) return
    let source: object | null = null
    try { source = Object.getPrototypeOf(new EventEmitter()) }
    catch { return }
    if (!source) return
    const p = proto as Record<string, unknown>
    const s = source as Record<string, unknown>
    for (const name of Object.getOwnPropertyNames(source)) {
      if (name === 'constructor') continue
      const value = s[name]
      if (typeof value !== 'function') continue
      if (typeof p[name] === 'function') continue
      try { Object.defineProperty(p, name, { value, configurable: true, writable: true }) }
      catch { /* frozen */ }
    }
  }

  // Crypto objects: noop stubs are sufficient.
  try { patchWithStubs(Object.getPrototypeOf(crypto.createVerify('sha256'))) } catch { /* ignore */ }
  try { patchWithStubs(Object.getPrototypeOf(crypto.createSign('sha256'))) } catch { /* ignore */ }
  try { patchWithStubs(Object.getPrototypeOf(crypto.createHash('sha256'))) } catch { /* ignore */ }
  try { patchWithStubs(Object.getPrototypeOf(crypto.createHmac('sha256', 'k'))) } catch { /* ignore */ }

  // xml2js.Parser: needs *real* EventEmitter behavior, not noops.
  try {
    const Parser = (xml2js as { Parser?: { prototype: unknown } })?.Parser
    if (Parser?.prototype) implantEventEmitter(Parser.prototype)
  }
  catch { /* xml2js shape unexpected */ }
})
