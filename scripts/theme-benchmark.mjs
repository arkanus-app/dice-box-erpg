import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'
import { createDistributionServer } from './startup-server.mjs'

const directory = path.resolve(process.argv[2] ?? 'dist')
const output = path.resolve(process.argv[3] ?? 'benchmarks/themes.json')
const runs = Number(process.env.THEME_RUNS ?? 5)
const assetLatencyMs = Number(process.env.THEME_LATENCY_MS ?? 60)
assert.ok(Number.isInteger(runs) && runs > 0)
assert.ok(Number.isFinite(assetLatencyMs) && assetLatencyMs >= 0)
const server = createDistributionServer(directory)
const samples = []
let browser
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  browser = await chromium.launch({ headless: true })
  for(const presentation of ['display', 'displayTimeline']) {
    for(let run = 0; run < runs; run++) {
      const context = await browser.newContext({ viewport: { width: 900, height: 650 } })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if(message.type() === 'error') errors.push(message.text()) })
      // Delay only theme/model JSON, keeping renderer import and GPU setup out
      // of this asset-loading comparison. Routing disables the HTTP cache.
      await page.route('**/themes/**/*.json', async route => {
        await delay(assetLatencyMs)
        await route.continue()
      })
      await page.goto(`http://127.0.0.1:${server.address().port}/`)
      const sample = await page.evaluate(async presentation => {
        const { DiceResultViewer } = await import('/dice3dview.es.js')
        const definitions = [
          ['vampire-v5-normal', 10, 10], ['vampire-v5-hunger', 10, 1],
          ['assimilation', 12, 12], ['fate', 6, 6],
          ['default-v2', 12, 8], ['default', 2, 1]
        ].map(([theme, sides, value], index) => ({ id: `die-${index}`, theme, sides, value }))
        const expectedThemes = definitions.map(die => die.theme)
        let configured = []
        let loaded = []
        let preparedAt = 0
        const viewer = new DiceResultViewer({
          container: '#stage', theme: 'default', mode: 'kinematic',
          assetPath: '/assets/dice-box/', enableShadows: false, duration: 0, delay: 0,
          onThemeConfigLoaded: config => configured.push(config.theme),
          onThemeLoaded: config => { loaded.push(config.theme); preparedAt = performance.now() }
        })
        const display = () => presentation === 'display'
          ? viewer.display({ id: 'theme-benchmark', seed: 'theme-benchmark', dice: definitions })
          : viewer.displayTimeline({
            id: 'theme-benchmark', seed: 'theme-benchmark', dice: definitions,
            events: definitions.map((die, index) => ({
              sequence: index + 1, type: 'roll', subject: 'die', rollIndex: 1,
              sourceNodeId: 'theme-benchmark', parentDieId: null, dieId: die.id, value: die.value
            }))
          })
        await viewer.init()
        const measure = async update => {
          configured = []; loaded = []
          const start = performance.now()
          if(update) await viewer.updateOptions({ themeColor: '#7c3aed', lightIntensity: 0.9 })
          const result = await display()
          const totalMs = performance.now() - start
          if(JSON.stringify(loaded) !== JSON.stringify(expectedThemes)) throw new Error('Theme callback order/count changed')
          if(JSON.stringify(result.dice.map(die => die.value)) !== JSON.stringify(definitions.map(die => die.value))) {
            throw new Error('Authoritative results changed')
          }
          return { preparedMs: preparedAt - start, totalMs, configLoads: configured.length, themeCallbacks: loaded.length }
        }
        try { return { first: await measure(false), afterOptionsUpdate: await measure(true) } }
        finally { viewer.dispose() }
      }, presentation)
      assert.deepEqual(errors, [], 'browser presentation errors')
      samples.push({ presentation, run, ...sample })
      await context.close()
    }
  }
  const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
  const summary = Object.fromEntries(['display', 'displayTimeline'].map(presentation => [presentation,
    Object.fromEntries(['first', 'afterOptionsUpdate'].map(stage => [stage,
      Object.fromEntries(['preparedMs', 'totalMs', 'configLoads', 'themeCallbacks'].map(metric => [metric,
        median(samples.filter(sample => sample.presentation === presentation).map(sample => sample[stage][metric]))
      ]))
    ]))
  ]))
  const result = { directory, browser: browser.version(), environment: { runs, assetLatencyMs, viewport: '900x650', duration: 0, themes: 6 }, summary, samples }
  mkdirSync(path.dirname(output), { recursive: true })
  writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`)
  console.log(JSON.stringify({ output, summary }, null, 2))
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
