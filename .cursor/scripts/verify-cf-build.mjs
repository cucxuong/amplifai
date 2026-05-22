import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))))
const distDir = path.join(rootDir, 'dist')

function fail(message) {
  console.error(`[verify-cf-build] ${message}`)
  process.exit(1)
}

function listFiles(dir, extensions) {
  if (!fs.existsSync(dir))
    return []

  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory())
      files.push(...listFiles(fullPath, extensions))
    else if (extensions.some(ext => entry.name.endsWith(ext)))
      files.push(fullPath)
  }
  return files
}

if (!fs.existsSync(distDir))
  fail('dist/ missing — run npm run build first')

const nuxtDir = path.join(distDir, '_nuxt')
if (!fs.existsSync(nuxtDir))
  fail('dist/_nuxt/ missing — client assets not generated')

const cssFiles = listFiles(nuxtDir, ['.css'])
const jsFiles = listFiles(nuxtDir, ['.js'])
if (cssFiles.length === 0)
  fail('dist/_nuxt/ has no .css files')
if (jsFiles.length === 0)
  fail('dist/_nuxt/ has no .js files')

const routesPath = path.join(distDir, '_routes.json')
if (!fs.existsSync(routesPath))
  fail('dist/_routes.json missing')

const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'))
const excludes = routes.exclude ?? []
if (!excludes.includes('/_nuxt/*'))
  fail('_routes.json must exclude /_nuxt/* so Pages serves static assets')

const workerPath = path.join(distDir, '_worker.js')
const workerIndex = path.join(workerPath, 'index.js')
if (!fs.existsSync(workerPath) && !fs.existsSync(workerIndex))
  fail('dist/_worker.js missing — Nitro Worker not generated')

for (const asset of ['global-bg.png', 'brand-logo.svg', 'favicon.svg']) {
  if (!fs.existsSync(path.join(distDir, asset)))
    fail(`dist/${asset} missing — public assets not copied`)
}

console.log('[verify-cf-build] OK')
console.log(`  _nuxt css: ${cssFiles.length}, js: ${jsFiles.length}`)
console.log(`  _routes.json exclude /_nuxt/*: yes`)
console.log(`  _worker.js: yes`)
console.log(`  public assets: global-bg.png, brand-logo.svg, favicon.svg`)
