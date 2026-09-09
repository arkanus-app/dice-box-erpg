import assert from 'node:assert/strict'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'
import { createDistributionServer } from './startup-server.mjs'

const directory = path.resolve(process.argv[2] ?? 'dist')
const screenshot = path.resolve(process.argv[3] ?? '../output/dice3d-startup/smoke.png')
const webgl1 = process.env.DICE_SMOKE_WEBGL1 === '1'
const server = createDistributionServer(directory)
const errors = []
let browser
let expectedFailure = false
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 900, height: 650 } })
  if(webgl1) await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return type === 'webgl2' ? null : getContext.call(this, type, ...args)
    }
  })
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if(message.type() === 'error' && !expectedFailure) errors.push(message.text())
  })
  await page.goto(`http://127.0.0.1:${server.address().port}/`)
  const lifecycle = await page.evaluate(async () => {
    const module = await import('/dice3dview.es.js')
    window.diceModule = module
    const create = options => new module.DiceResultViewer({
      container: '#stage', assetPath: '/assets/dice-box/', theme: 'default-v2',
      mode: 'physics', enableShadows: false, scale: 4, duration: 180, ...options
    })
    window.createTestViewer = create
    let contexts = 0
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if(type === 'webgl' || type === 'webgl2') contexts++
      return getContext.call(this, type, ...args)
    }
    const control = create()
    await control.init()
    control.dispose()
    const singleContexts = contexts
    contexts = 0
    const concurrent = create()
    await Promise.all([concurrent.init(), concurrent.init(), concurrent.init()])
    concurrent.dispose()
    const concurrentContexts = contexts
    const early = create()
    const pending = early.init()
    early.dispose()
    let cancelledEarly = false
    try { await pending } catch(error) { cancelledEarly = /disposed/.test(error.message) }
    const late = create({ onThemeConfigLoaded: () => late.dispose() })
    let cancelledLate = false
    try { await late.init() } catch(error) { cancelledLate = /disposed/.test(error.message) }
    HTMLCanvasElement.prototype.getContext = getContext
    return { singleContexts, concurrentContexts, cancelledEarly, cancelledLate, remainingCanvases: document.querySelectorAll('canvas').length }
  })
  assert.equal(lifecycle.singleContexts, lifecycle.concurrentContexts, 'concurrent init created multiple renderers')
  assert.equal(lifecycle.cancelledEarly, true)
  assert.equal(lifecycle.cancelledLate, true)
  assert.equal(lifecycle.remainingCanvases, 0)

  // Failed WASM initialization must release the scene and allow the same URL to retry.
  expectedFailure = true
  await page.route('**/HavokPhysics.wasm?retry-test', route => route.fulfill({ status: 503, body: 'temporarily unavailable' }))
  const failed = await page.evaluate(async () => {
    window.retryViewer = window.createTestViewer({ physicsWasmUrl: '/assets/dice-box/havok/HavokPhysics.wasm?retry-test' })
    try { await window.retryViewer.init(); return false } catch { return true }
  })
  assert.equal(failed, true)
  await page.unroute('**/HavokPhysics.wasm?retry-test')
  expectedFailure = false
  await page.evaluate(async () => { await window.retryViewer.init(); window.retryViewer.dispose() })

  const modelCancellation = []
  for(const method of ['display', 'displayTimeline']) {
    let heldRoute
    let notifyRequested
    const requested = new Promise(resolve => { notifyRequested = resolve })
    await page.route('**/themes/default/default.json', route => { heldRoute = route; notifyRequested() })
    await page.evaluate(async method => {
      const viewer = window.createTestViewer({ mode: 'kinematic' })
      await viewer.init()
      window.modelViewer = viewer
      const pending = method === 'display'
        ? viewer.display({ id: 'model-cancel', dice: [{ id: 'd6', sides: 6, value: 4 }] })
        : viewer.displayTimeline({ id: 'model-cancel', dice: [{ id: 'd6', sides: 6 }], events: [{
          sequence: 1, type: 'roll', subject: 'die', rollIndex: 1, sourceNodeId: 'smoke', parentDieId: null, dieId: 'd6', value: 4
        }] })
      window.modelCancelled = pending.then(() => false, window.diceModule.isDisplayCancelledError)
    }, method)
    await Promise.race([requested, new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Model request did not start')), 15_000).unref()
    })])
    const result = await page.evaluate(async () => {
      window.modelViewer.dispose()
      return { cancelled: await window.modelCancelled, canvases: document.querySelectorAll('canvas').length }
    })
    await heldRoute.continue()
    await page.unroute('**/themes/default/default.json')
    assert.equal(result.cancelled, true, `${method} must cancel while loading a model`)
    assert.equal(result.canvases, 0)
    modelCancellation.push({ method, ...result })
  }

  const features = await page.evaluate(async () => {
    const { createMixedDisplayRequest, isDisplayCancelledError } = window.diceModule
    const themeConfigurations = []
    const viewer = window.createTestViewer({
      mode: 'kinematic', enableShadows: false, scale: 3.2,
      onThemeConfigLoaded: config => themeConfigurations.push(config.theme)
    })
    const faces = [2, 4, 6, 8, 10, 12, 20, 100]
    const standard = faces.map((sides, index) => ({ id: `standard-${index}`, sides, value: sides }))
    const verify = (result, expected) => {
      if(JSON.stringify(result.dice.map(die => die.value)) !== JSON.stringify(expected)) throw new Error('Resolved faces changed')
    }
    await viewer.init()
    verify(await viewer.display({ id: 'standard', dice: standard }), faces)
    await viewer.updateOptions({ enableShadows: true })
    verify(await viewer.display({ id: 'physics', mode: 'physics', dice: [{ id: 'physics-d20', sides: 20, value: 17 }] }), [17])
    const symbolic = createMixedDisplayRequest({ id: 'symbols', mode: 'kinematic', dice: [
      { id: 'v5-normal', sides: 10, value: 10, profileId: 'vampire-v5-normal-d10' },
      { id: 'v5-hunger', sides: 10, value: 1, profileId: 'vampire-v5-hunger-d10' },
      { id: 'assimilation', sides: 12, value: 12, profileId: 'assimilation-d12' },
      { id: 'fate', sides: 6, value: 6, profileId: 'fate-df' },
      { id: 'hope', sides: 12, value: 8, profileId: 'daggerheart-hope-d12' },
      { id: 'fear', sides: 12, value: 3, profileId: 'daggerheart-fear-d12', discarded: true },
      { id: 'coin', sides: 2, value: 1 }
    ] })
    verify(await viewer.display(symbolic), symbolic.dice.map(die => die.value))
    const event = { subject: 'die', rollIndex: 1, sourceNodeId: 'smoke', parentDieId: null }
    const progress = []
    await viewer.updateOptions({ onTimelineProgress: value => progress.push(value.stage), timeline: { enabled: true, phaseGapMs: 10 } })
    await viewer.displayTimeline({ id: 'timeline', mode: 'physics', dice: [{ id: 'root', sides: 6 }, { id: 'child', sides: 6 }], events: [
      { ...event, sequence: 1, type: 'roll', dieId: 'root', value: 6 },
      { ...event, sequence: 2, type: 'roll', dieId: 'child', parentDieId: 'root', value: 4 },
      { ...event, sequence: 3, type: 'explode', dieId: 'root', childDieId: 'child', value: 4, reason: 'explode' },
      { ...event, sequence: 4, type: 'classify', dieId: 'root', outcome: 'critical-success', value: 6 }
    ] })
    if(!progress.includes('complete')) throw new Error('Timeline did not complete')
    await viewer.updateOptions({ duration: 1500 })
    const pending = viewer.display({ id: 'cancel', mode: 'kinematic', dice: standard })
    setTimeout(() => viewer.clear(), 20)
    let cancelled = false
    try { await pending } catch(error) { cancelled = isDisplayCancelledError(error) }
    if(!cancelled) throw new Error('clear() failed to cancel the display')
    await viewer.updateOptions({ duration: 180 })
    await viewer.display(symbolic)
    if(new Set(themeConfigurations).size !== themeConfigurations.length) throw new Error('Visual option updates refetched a theme configuration')
    window.screenshotViewer = viewer
    return { faces, symbolic: symbolic.dice.length, progress, cancelled, themeConfigurations }
  })
  mkdirSync(path.dirname(screenshot), { recursive: true })
  await page.screenshot({ path: screenshot })
  await page.evaluate(() => window.screenshotViewer.dispose())
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ directory, webgl1, lifecycle, modelCancellation, features, screenshot }, null, 2))
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
