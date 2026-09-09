import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { gzipSync, brotliCompressSync } from 'node:zlib'

const [beforeArg, afterArg, outputArg] = process.argv.slice(2)
assert.ok(beforeArg && afterArg && outputArg, 'Usage: node scripts/compare-size.mjs <before-dist> <after-dist> <output-json>')
const measure = directory => {
  const manifestFile = ['manifest.json', '.vite/manifest.json'].map(file => path.join(directory, file)).find(existsSync)
  assert.ok(manifestFile, `Missing build manifest in ${directory}`)
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
  const initial = new Set()
  const walk = key => {
    const entry = manifest[key]
    assert.ok(entry, `Missing manifest entry: ${key}`)
    if(initial.has(entry.file)) return
    initial.add(entry.file)
    for(const dependency of entry.imports ?? []) walk(dependency)
  }
  for(const [key, entry] of Object.entries(manifest)) if(entry.isEntry) walk(key)
  const visit = (folder = '') => readdirSync(path.join(directory, folder), { withFileTypes: true }).flatMap(entry => {
    if(!folder && ['external', 'adapters'].includes(entry.name)) return []
    const file = path.join(folder, entry.name)
    return entry.isDirectory() ? visit(file) : [file]
  })
  const sum = files => [...files].reduce((metrics, file) => {
    const source = readFileSync(path.join(directory, file))
    metrics.files++
    metrics.rawBytes += source.length
    metrics.gzipBytes += gzipSync(source, { level: 9 }).length
    metrics.brotliBytes += brotliCompressSync(source).length
    return metrics
  }, { files: 0, rawBytes: 0, gzipBytes: 0, brotliBytes: 0 })
  const files = visit()
  return {
    initial: sum([...initial].filter(file => file.endsWith('.js'))),
    allJavaScript: sum(files.filter(file => file.endsWith('.js'))),
    wasm: sum(files.filter(file => file.endsWith('.wasm')))
  }
}
const beforeDirectory = path.resolve(beforeArg)
const afterDirectory = path.resolve(afterArg)
const before = measure(beforeDirectory)
const after = measure(afterDirectory)
const reductionPercent = Object.fromEntries(Object.keys(before).map(section => [section,
  Object.fromEntries(['rawBytes', 'gzipBytes', 'brotliBytes'].map(metric => [metric,
    before[section][metric] ? (1 - after[section][metric] / before[section][metric]) * 100 : 0
  ]))
]))
const result = { beforeDirectory, afterDirectory, before, after, reductionPercent }
writeFileSync(path.resolve(outputArg), `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
