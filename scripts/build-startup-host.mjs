import { cpSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Rebundle /external using the consumer's actual Vite and Babylon installation.
// Output stays outside the consumer checkout; its lockfile is never rewritten.
const [distributionArg, modulesArg, outputArg, toolchainArg = modulesArg] = process.argv.slice(2)
if(!distributionArg || !modulesArg || !outputArg) {
  throw new Error('Usage: node scripts/build-startup-host.mjs <dist> <consumer-node_modules> <output> [toolchain-node_modules]')
}
const distribution = path.resolve(distributionArg)
const modules = path.resolve(modulesArg)
const output = path.resolve(outputArg)
const { build } = await import(pathToFileURL(path.join(path.resolve(toolchainArg), 'vite/dist/node/index.js')).href)
const entry = 'virtual:dice-startup-host'
await build({
  configFile: false,
  root: distribution,
  publicDir: false,
  base: '/',
  logLevel: 'warn',
  resolve: {
    alias: [
      { find: /^@babylonjs\/core\//, replacement: `${path.join(modules, '@babylonjs/core').replaceAll('\\', '/')}/` },
      { find: '@babylonjs/havok', replacement: path.join(modules, '@babylonjs/havok/lib/esm/HavokPhysics_es.js') }
    ]
  },
  plugins: [{
    name: 'startup-consumer-fixture',
    resolveId(id) { if(id === entry) return `\0${entry}` },
    load(id) {
      if(id === `\0${entry}`) return `export * from ${JSON.stringify(path.join(distribution, 'external/dice3dview.es.js').replaceAll('\\', '/'))}`
    },
    transform(code, id) {
      if(!id.replaceAll('\\', '/').endsWith('/HavokPhysics_es.js')) return
      const expression = 'new URL("HavokPhysics.wasm",import.meta.url).href'
      if(!code.includes(expression)) this.error('Havok fallback expression changed')
      return { code: code.replace(expression, '"HavokPhysics.wasm"'), map: null }
    }
  }],
  build: {
    outDir: output,
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: entry,
      preserveEntrySignatures: 'strict',
      output: { entryFileNames: 'dice3dview.es.js', chunkFileNames: 'chunks/[name]-[hash].js' }
    }
  }
})
mkdirSync(path.join(output, 'assets'), { recursive: true })
cpSync(path.join(distribution, 'assets/dice-box'), path.join(output, 'assets/dice-box'), { recursive: true })
writeFileSync(path.join(output, 'fixture.json'), JSON.stringify({ distribution, modules }, null, 2))
console.log(`Consumer fixture built at ${output}`)
