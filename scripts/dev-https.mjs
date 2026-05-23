#!/usr/bin/env node
/**
 * Dev server with HTTPS via mkcert (.cert/localhost.pem + localhost-key.pem).
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const certDir = path.join(rootDir, '.cert')
const keyPath = path.join(certDir, 'localhost-key.pem')
const certPath = path.join(certDir, 'localhost.pem')
const bundledMkcert = path.join(rootDir, '.cursor/scripts/mkcert.exe')

function lanIpv4Addresses() {
  const ips = new Set(['localhost', '127.0.0.1', '::1'])
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal)
        ips.add(iface.address)
    }
  }
  return [...ips]
}

function resolveMkcert() {
  for (const candidate of ['mkcert', 'mkcert.exe', bundledMkcert]) {
    if (candidate.includes(path.sep) && fs.existsSync(candidate))
      return candidate
    const result = spawnSync(candidate, ['-CAROOT'], { stdio: 'ignore', shell: false })
    if (result.status === 0)
      return candidate
  }
  return null
}

function ensureCerts() {
  if (fs.existsSync(keyPath) && fs.existsSync(certPath))
    return true

  const mkcert = resolveMkcert()
  if (!mkcert) {
    console.warn('⚠️  mkcert not found. Install: winget install FiloSottile.mkcert')
    console.warn('Or run: node scripts/dev-https.mjs after placing mkcert on PATH\n')
    return false
  }

  fs.mkdirSync(certDir, { recursive: true })
  const domains = lanIpv4Addresses()
  console.log('[dev] Generating mkcert files for:', domains.join(', '))

  spawnSync(mkcert, ['-install'], { cwd: rootDir, stdio: 'inherit', shell: false })

  const result = spawnSync(
    mkcert,
    ['-cert-file', certPath, '-key-file', keyPath, ...domains],
    { cwd: rootDir, stdio: 'inherit', shell: false },
  )

  return result.status === 0 && fs.existsSync(keyPath) && fs.existsSync(certPath)
}

const hasCerts = ensureCerts()
const nuxtArgs = ['dev', '--host', '0.0.0.0']

if (hasCerts) {
  nuxtArgs.push('--https', `--https.key=${keyPath}`, `--https.cert=${certPath}`)
  console.log('[dev] HTTPS via mkcert:', certPath)
}
else {
  console.warn('⚠️  HTTPS certificates not found in .cert/')
  console.warn('Dev will run over HTTP until certs exist.\n')
}

console.log('[dev] On phone use https://<your-lan-ip>:3000\n')

const nuxtBin = path.join(rootDir, 'node_modules/nuxt/bin/nuxt.mjs')
const childEnv = { ...process.env }
if (hasCerts)
  childEnv.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const child = spawn(process.execPath, [nuxtBin, ...nuxtArgs], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false,
  env: childEnv,
})

child.on('exit', code => process.exit(code ?? 0))
