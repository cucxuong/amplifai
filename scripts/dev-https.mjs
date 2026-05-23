#!/usr/bin/env node
/**
 * Development server with HTTPS support using mkcert certificates.
 *
 * Prerequisites:
 * - mkcert certificates in .cert/ directory (localhost.pem and localhost-key.pem)
 * - Create with: mkcert -install && mkcert -cert-file .cert/localhost.pem -key-file .cert/localhost-key.pem localhost
 */

import { spawn } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const certDir = path.join(rootDir, '.cert')
const keyPath = path.join(certDir, 'localhost-key.pem')
const certPath = path.join(certDir, 'localhost.pem')

// Check if certificates exist
const hasCerts = existsSync(keyPath) && existsSync(certPath)

const args = [
  'dev',
  ...(hasCerts ? ['--https.key', keyPath, '--https.cert', certPath] : []),
]

console.log(`Starting Nuxt dev server${hasCerts ? ' with HTTPS' : ''}...`)
if (!hasCerts) {
  console.warn('⚠️  HTTPS certificates not found in .cert/')
  console.warn('To enable HTTPS, create certificates with:')
  console.warn('  mkcert -install')
  console.warn(`  mkcert -cert-file ${certPath} -key-file ${keyPath} localhost`)
}

const child = spawn('npx', ['nuxt', ...args], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
})

process.on('SIGINT', () => {
  child.kill('SIGINT')
})

process.on('SIGTERM', () => {
  child.kill('SIGTERM')
})

child.on('exit', (code) => {
  process.exit(code)
})
