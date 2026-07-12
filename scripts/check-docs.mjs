import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const markdownFiles = []

const collectMarkdown = directory => {
  for(const entry of readdirSync(directory)) {
    if(entry === 'node_modules' || entry === 'dist' || entry === '.git') continue
    const target = path.join(directory, entry)
    if(statSync(target).isDirectory()) collectMarkdown(target)
    else if(entry.endsWith('.md')) markdownFiles.push(target)
  }
}

collectMarkdown(root)

const failures = []
const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g

for(const file of markdownFiles) {
  const content = readFileSync(file, 'utf8')
  const fenceCount = content.match(/^```/gm)?.length ?? 0
  if(fenceCount % 2 !== 0) {
    failures.push(`${path.relative(root, file)} has an unclosed fenced code block.`)
  }
  for(const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1]?.trim()
    if(!rawTarget || rawTarget.startsWith('#') || /^(?:https?:|mailto:)/.test(rawTarget)) continue
    const targetWithoutAnchor = rawTarget.split('#', 1)[0]
    if(!targetWithoutAnchor) continue
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(targetWithoutAnchor))
    if(!existsSync(resolved)) {
      failures.push(`${path.relative(root, file)} links to missing '${rawTarget}'.`)
    }
  }
}

const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const version = packageJson.version
const readme = readFileSync(path.join(root, 'README.md'), 'utf8')
const changelog = readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8')
if(!readme.includes(`Versão atual: **${version}**`)) {
  failures.push(`README.md does not declare package version ${version}.`)
}
if(!changelog.includes(`## [${version}]`)) {
  failures.push(`CHANGELOG.md has no entry for package version ${version}.`)
}

const cssExport = packageJson.exports?.['./style.css']
if(typeof cssExport !== 'string' || !existsSync(path.join(root, cssExport))) {
  failures.push('The public ./style.css export is missing or points to a missing build asset.')
}

if(failures.length > 0) {
  throw new Error(`Documentation check failed:\n${failures.map(failure => `- ${failure}`).join('\n')}`)
}

console.log(`Documentation check passed: ${markdownFiles.length} Markdown files, version ${version}.`)
