import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, devices } from 'playwright'
import { createDistributionServer } from './startup-server.mjs'

// Production files only: no Vite development transforms, HMR or optimizer.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const directory = path.resolve(process.argv[2] ?? path.join(root, 'dist'))
const output = process.argv[3]
const runs = Number(process.env.STARTUP_RUNS ?? 5)
const latency = Number(process.env.STARTUP_LATENCY_MS ?? 60)
const cpuRate = Number(process.env.STARTUP_CPU_RATE ?? 4)
const server = createDistributionServer(directory)

const samples = []
const errors = []
let browser
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  browser = await chromium.launch({ headless: true })
  for(const enableShadows of [false, true]) {
    for(let run = 0; run < runs; run++) {
      const context = await browser.newContext({ ...devices['Pixel 5'] })
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if(message.type() === 'error') errors.push(message.text()) })
      const cdp = await context.newCDPSession(page)
      await cdp.send('Network.enable')
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false, latency, downloadThroughput: 1_600_000, uploadThroughput: 750_000
      })
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate })
      await page.goto(`http://127.0.0.1:${server.address().port}/`)
      const sample = await page.evaluate(async ({ enableShadows }) => {
        const start = performance.now()
        const { DiceResultViewer } = await import('/dice3dview.es.js')
        const importMs = performance.now() - start
        const metrics = () => {
          const resources = performance.getEntriesByType('resource')
          return { requests: resources.length, transferBytes: resources.reduce((n, r) => n + r.transferSize, 0) }
        }
        const imported = metrics()
        const create = () => new DiceResultViewer({
          container: '#stage', assetPath: '/assets/dice-box/', theme: 'default-v2',
          mode: 'physics', enableShadows, antialias: false, scale: 5.1,
          settleTimeout: 4600, gravity: 1.3, mass: 1.08, startingHeight: 7.6,
          spinForce: 5.8, throwForce: 6.4, spawnSpacing: 1.72
        })
        const viewer = create()
        const initStart = performance.now()
        await viewer.init()
        const initMs = performance.now() - initStart
        const readyMs = performance.now() - start
        const canvasSize = { width: viewer.canvas.clientWidth, height: viewer.canvas.clientHeight }
        if(canvasSize.width !== innerWidth || canvasSize.height !== innerHeight) throw new Error('Canvas does not match the frontend viewport')
        const initialized = metrics()
        const result = await viewer.display({ id: 'startup', seed: 'startup-holdout', dice: [{ id: 'd20', sides: 20, value: 17 }] })
        if(result.dice[0]?.value !== 17) throw new Error('Resolved face changed')
        const firstPresentationMs = performance.now() - start
        viewer.dispose()
        const remountStart = performance.now()
        const remounted = create()
        await remounted.init()
        const remountInitMs = performance.now() - remountStart
        remounted.dispose()
        if(document.querySelector('canvas')) throw new Error('Canvas leaked')
        return { importMs, initMs, readyMs, firstPresentationMs, remountInitMs, canvasSize, imported, initialized, total: metrics() }
      }, { enableShadows })
      samples.push({ run, enableShadows, ...sample })
      console.error(JSON.stringify({ run, enableShadows, readyMs: sample.readyMs, remountInitMs: sample.remountInitMs }))
      await context.close()
    }
  }
  if(errors.length) throw new Error(errors.join('\n'))
  const percentile = (values, p) => values.sort((a, b) => a - b)[Math.ceil(values.length * p) - 1]
  const summary = [false, true].map(enableShadows => {
    const group = samples.filter(sample => sample.enableShadows === enableShadows)
    return { enableShadows, ...Object.fromEntries(['importMs', 'initMs', 'readyMs', 'firstPresentationMs', 'remountInitMs'].map(key => [key, {
      median: percentile(group.map(s => s[key]), 0.5), p95: percentile(group.map(s => s[key]), 0.95)
    }])) }
  })
  const report = { capturedAt: new Date().toISOString(), directory, environment: { node: process.version, platform: process.platform, chromium: browser.version(), device: 'Pixel 5 emulation (desktop CPU/GPU)', cpuRate, latency, downloadBytesPerSecond: 1_600_000, compression: 'br', runs, coldContextPerRun: true }, summary, samples }
  if(output) {
    mkdirSync(path.dirname(path.resolve(output)), { recursive: true })
    writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
  }
  console.log(JSON.stringify(report, null, 2))
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
