import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const files = []

const visit = directory => {
  for(const entry of readdirSync(directory)) {
    const target = path.join(directory, entry)
    if(statSync(target).isDirectory()) visit(target)
    else files.push(target)
  }
}

visit(dist)

const totalBytes = files.reduce((total, file) => total + statSync(file).size, 0)
const maximumBytes = 8 * 1024 * 1024
if(totalBytes > maximumBytes) {
  throw new Error(`Bundle budget exceeded: ${totalBytes} bytes (maximum ${maximumBytes}).`)
}

const initialGraph = files
  .filter(file => file.endsWith('.js') && !path.basename(file).startsWith('PhysicsRenderer-'))
  .map(file => readFileSync(file, 'utf8'))
  .join('\n')

if(initialGraph.includes('HavokPhysics.wasm') || initialGraph.includes('HavokPlugin')) {
  throw new Error('The kinematic graph unexpectedly contains Havok physics code.')
}

const wasm = path.join(dist, 'assets', 'dice-box', 'havok', 'HavokPhysics.wasm')
if(!files.includes(wasm)) throw new Error('The lazy physics WASM asset was not emitted.')

console.log(`Bundle budget passed: ${totalBytes} bytes across ${files.length} files.`)
