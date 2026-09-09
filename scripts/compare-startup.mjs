import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'

const [baselinePath, candidatePath, outputPath] = process.argv.slice(2)
if(!baselinePath || !candidatePath) throw new Error('Usage: node scripts/compare-startup.mjs <baseline.json> <candidate.json> [output.json]')
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'))
assert.deepEqual(candidate.environment, baseline.environment, 'Benchmark environments differ')
assert.deepEqual(candidate.samples[0].canvasSize, baseline.samples[0].canvasSize, 'Canvas sizes differ')
assert.ok(candidate.samples[0].canvasSize?.width, 'Missing viewport validation')
const round = value => Number(value.toFixed(2))
const scenarios = baseline.summary.map(before => {
  const after = candidate.summary.find(row => row.enableShadows === before.enableShadows)
  return { enableShadows: before.enableShadows, ...Object.fromEntries([
    'importMs', 'initMs', 'readyMs', 'firstPresentationMs', 'remountInitMs'
  ].map(metric => [metric, {
    baselineMedian: round(before[metric].median), candidateMedian: round(after[metric].median),
    reductionPercent: round((1 - after[metric].median / before[metric].median) * 100),
    baselineP95: round(before[metric].p95), candidateP95: round(after[metric].p95)
  }])) }
})
const report = { baselinePath, candidatePath, environment: baseline.environment, canvasSize: candidate.samples[0].canvasSize, scenarios }
if(outputPath) writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
