// Extracts the published v2 build (tag v2.6.0, dist/ is versioned) next to the
// comparison page, so the browser benchmark loads v2 exactly as it shipped.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ref = process.argv[2] ?? 'v2.6.0'
const target = path.join(root, 'benchmarks/compare/v2')

const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 64 * 1024 * 1024 })
rmSync(target, { recursive: true, force: true })
const files = git('ls-tree', '-r', '--name-only', ref, 'dist').toString('utf8').split('\n').filter(Boolean)
for(const file of files) {
	const destination = path.join(target, path.relative('dist', file))
	mkdirSync(path.dirname(destination), { recursive: true })
	writeFileSync(destination, git('show', `${ref}:${file}`))
}
if(!existsSync(path.join(target, 'dice3dview.es.js'))) throw new Error(`The ${ref} build was not extracted.`)
console.log(`v2 build (${ref}, ${files.length} files) ready in benchmarks/compare/v2/`)
