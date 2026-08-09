import { chromium, devices } from 'playwright'
import { createServer } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const iterations = Number.parseInt(process.env.DICE_BENCH_ITERATIONS ?? '5', 10)
const server = await createServer({
	root,
	logLevel: 'error',
	server: { host: '127.0.0.1', port: 4175, strictPort: true }
})

const percentile = (values, ratio) => {
	const sorted = [...values].sort((left, right) => left - right)
	return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)] ?? 0
}

const summarize = samples => ({
	iterations: samples.length,
	medianMs: percentile(samples, 0.5),
	p95Ms: percentile(samples, 0.95),
	minMs: Math.min(...samples),
	maxMs: Math.max(...samples)
})

let browser
try {
	await server.listen()
	browser = await chromium.launch({ headless: true })
	const context = await browser.newContext({ ...devices['Pixel 5'] })
	const page = await context.newPage()
	const client = await context.newCDPSession(page)
	await client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
	await page.goto('http://127.0.0.1:4175/e2e/index.html', { waitUntil: 'networkidle' })
	await page.waitForFunction(() => Boolean(window.diceSmoke))
	await page.evaluate(() => window.diceSmoke.setPhysicsProfiling(true))

	const runScenario = values => page.evaluate(valuesToDisplay =>
		window.diceSmoke.runDisplay({ sides: valuesToDisplay.length === 1 ? 20 : 6, values: valuesToDisplay, mode: 'physics' }), values)
	const scenarios = {
		d20: [20],
		'd12-d6': [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6]
	}
	const results = {}
	for(const [name, values] of Object.entries(scenarios)) {
		await runScenario(values)
		const samples = []
		const hotPathSamples = []
		for(let index = 0; index < iterations; index++) {
			const result = await runScenario(values)
			samples.push(result.displayMs)
			if(result.physicsPerformance) hotPathSamples.push(result.physicsPerformance)
		}
		const totals = hotPathSamples.reduce((result, sample) => {
			for(const field of ['frames', 'physicsSteps', 'physicsSteps90Hz', 'physicsSteps120Hz', 'physicsSteps180Hz', 'guidanceCalls', 'guidanceMs', 'renderMs', 'maxRenderMs', 'collisionEvents', 'launchClearanceQueries', 'launchPairChecks']) {
				result[field] = (result[field] ?? 0) + sample[field]
			}
			return result
		}, {})
		results[name] = {
			...summarize(samples),
			hotPathAverage: Object.fromEntries(
				Object.entries(totals).map(([field, total]) => [field, total / Math.max(1, hotPathSamples.length)])
			)
		}
	}

	console.log(JSON.stringify({
		emulation: 'Playwright Pixel 5, 4x CPU slowdown',
		results
	}, null, 2))
} finally {
	await browser?.close()
	await server.close()
}
