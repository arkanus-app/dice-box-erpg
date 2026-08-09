import { chromium, devices } from 'playwright'
import { createServer } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const server = await createServer({
	root,
	logLevel: 'error',
	server: { host: '127.0.0.1', port: 4174, strictPort: true }
})

const browserErrors = []
let browser
try {
	await server.listen()
	browser = await chromium.launch({ headless: true })
	const context = await browser.newContext({ ...devices['Pixel 5'] })
	const runPage = async () => {
		const page = await context.newPage()
		page.on('pageerror', error => browserErrors.push(error.message))
		await page.goto('http://127.0.0.1:4174/e2e/index.html', { waitUntil: 'networkidle' })
		await page.waitForFunction(() => Boolean(window.diceSmoke))
		return page
	}

	const coldPage = await runPage()
	const d20 = await coldPage.evaluate(() => window.diceSmoke.runDisplay({ sides: 20, values: [20] }))
	await coldPage.evaluate(() => window.diceSmoke.runDisplay({
		sides: 6,
		values: [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6],
		enableShadows: true
	}))
	await coldPage.evaluate(() => window.diceSmoke.runTimeline())
	await coldPage.evaluate(() => window.diceSmoke.runCancellation())
	await coldPage.evaluate(() => window.diceSmoke.runDisplay({ sides: 20, values: [17], mode: 'physics' }))
	const cold = await coldPage.evaluate(() => ({
		importMs: window.diceSmoke.importMs,
		...window.diceSmoke.resourceMetrics()
	}))
	await coldPage.close()

	const warmPage = await runPage()
	const warmD20 = await warmPage.evaluate(() => window.diceSmoke.runDisplay({ sides: 20, values: [20] }))
	const warm = await warmPage.evaluate(() => ({
		importMs: window.diceSmoke.importMs,
		...window.diceSmoke.resourceMetrics()
	}))
	await warmPage.close()
	await context.close()

	if(browserErrors.length) throw new Error(`Browser errors:\n${browserErrors.join('\n')}`)
	console.log(JSON.stringify({
		emulation: 'Playwright Pixel 5',
		cold: { ...cold, initMs: d20.initMs, firstDisplayMs: d20.displayMs },
		warm: { ...warm, initMs: warmD20.initMs, firstDisplayMs: warmD20.displayMs }
	}, null, 2))
	console.log('Chromium smoke passed: d20, 12d6, shadows off/on, timeline, physics, cancellation, and disposal.')
} finally {
	await browser?.close()
	await server.close()
}
