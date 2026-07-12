import { createDisplayCanvas } from './canvas'
import { normalizeDisplayRequest, getDisplayBodyCount } from './displayRequest'
import { DisplayCancelledError, isDisplayCancelledError } from './errors'
import KinematicRenderer from './renderers/KinematicRenderer'
import { ThemeRepository } from './themeRepository'
import type {
	DisplayMode,
	DisplayRenderer,
	DisplayRequest,
	DisplayResult,
	RequiredViewerOptions,
	ViewerOptions
} from './types'

const noop = (): void => undefined

const createOptions = (options: ViewerOptions): RequiredViewerOptions => ({
	id: options.id ?? `dice-canvas-${Date.now()}`,
	container: options.container ?? null,
	assetPath: options.assetPath ?? '/assets/dice-box/',
	origin: options.origin ?? (typeof window === 'undefined' ? '' : window.location.origin),
	mode: options.mode ?? 'kinematic',
	theme: options.theme ?? 'default',
	preloadThemes: [...(options.preloadThemes ?? [])],
	externalThemes: { ...(options.externalThemes ?? {}) },
	themeColor: options.themeColor ?? '#2e8555',
	maxDice: options.maxDice ?? 120,
	enableShadows: options.enableShadows ?? true,
	shadowTransparency: options.shadowTransparency ?? 0.8,
	shadowResolution: options.shadowResolution ?? 1024,
	lightIntensity: options.lightIntensity ?? 1,
	antialias: options.antialias ?? true,
	scale: options.scale ?? 5,
	duration: options.duration ?? 1100,
	delay: options.delay ?? 10,
	gravity: options.gravity ?? 1.3,
	mass: options.mass ?? 1.08,
	startingHeight: options.startingHeight ?? 7.6,
	spinForce: options.spinForce ?? 5.8,
	throwForce: options.throwForce ?? 6.4,
	aggressiveThrowChance: options.aggressiveThrowChance ?? options.wallBounceChance ?? 0.12,
	wallBounceChance: options.wallBounceChance ?? options.aggressiveThrowChance ?? 0.12,
	wallPadding: options.wallPadding ?? 0.25,
	colliderScale: options.colliderScale ?? 1.02,
	spawnSpacing: options.spawnSpacing ?? 1.72,
	spawnHeightStep: options.spawnHeightStep ?? 0,
	spawnOverscan: options.spawnOverscan ?? 0.15,
	friction: options.friction ?? 0.54,
	restitution: options.restitution ?? 0.29,
	linearDamping: options.linearDamping ?? 0.1,
	angularDamping: options.angularDamping ?? 0.08,
	settleTimeout: options.settleTimeout ?? 4200,
	physicsWasmUrl: options.physicsWasmUrl ?? '',
	onCollision: options.onCollision ?? noop,
	onThemeConfigLoaded: options.onThemeConfigLoaded ?? noop,
	onThemeLoaded: options.onThemeLoaded ?? noop
})

const validateOptions = (options: RequiredViewerOptions): void => {
	if(!Number.isInteger(options.maxDice) || options.maxDice < 1) {
		throw new Error('Viewer option maxDice must be a positive integer.')
	}
	if(options.mode !== 'kinematic' && options.mode !== 'physics') {
		throw new Error(`Unsupported display mode '${String(options.mode)}'.`)
	}
	if(!Number.isFinite(options.aggressiveThrowChance)
		|| options.aggressiveThrowChance < 0
		|| options.aggressiveThrowChance > 1) {
		throw new Error('Viewer option aggressiveThrowChance must be between 0 and 1.')
	}
}

export class DiceResultViewer {
	readonly canvas: HTMLCanvasElement
	#options: RequiredViewerOptions
	readonly #themes: ThemeRepository
	#renderer: DisplayRenderer | undefined
	#rendererMode: DisplayMode | undefined
	#active: AbortController | undefined
	#resizeHandler: (() => void) | undefined
	#resizeObserver: ResizeObserver | undefined
	#initialized = false
	#disposed = false

	constructor(options: ViewerOptions = {}) {
		this.#options = createOptions(options)
		validateOptions(this.#options)
		this.canvas = createDisplayCanvas(this.#options.container, this.#options.id)
		this.#themes = new ThemeRepository(this.#options)
	}

	async init(): Promise<this> {
		this.#assertUsable()
		if(this.#initialized) return this
		await this.#ensureRenderer(this.#options.mode)
		await Promise.all([this.#options.theme, ...this.#options.preloadThemes].map(theme => this.#themes.load(theme)))
		this.#resizeHandler = (): void => this.resize()
		window.addEventListener('resize', this.#resizeHandler, { passive: true })
		if(typeof ResizeObserver !== 'undefined') {
			this.#resizeObserver = new ResizeObserver(() => this.resize())
			this.#resizeObserver.observe(this.canvas.parentElement ?? this.canvas)
		}
		this.resize()
		this.#initialized = true
		return this
	}

	async display(request: DisplayRequest): Promise<DisplayResult> {
		this.#assertUsable()
		const normalized = normalizeDisplayRequest(request, this.#options)
		const bodyCount = getDisplayBodyCount(normalized.dice)
		if(bodyCount > this.#options.maxDice) {
			throw new Error(`Display exceeds maxDice (${this.#options.maxDice}). Requested ${bodyCount} visual bodies.`)
		}
		this.clear()
		const controller = new AbortController()
		this.#active = controller
		const startedAt = performance.now()
		try {
			if(!this.#initialized) await this.init()
			const renderer = await this.#ensureRenderer(normalized.mode)
			if(controller.signal.aborted) throw new DisplayCancelledError()
			await renderer.display(normalized, controller.signal)
		} catch(error) {
			if(isDisplayCancelledError(error) || controller.signal.aborted) throw new DisplayCancelledError()
			// Rendering is best-effort. The resolved values remain authoritative even
			// when WebGL, a theme asset, or the optional physics runtime is unavailable.
			console.error('[DiceResultViewer] Presentation failed:', error)
		} finally {
			if(this.#active === controller) this.#active = undefined
		}
		return Object.freeze({
			id: normalized.id,
			dice: Object.freeze(normalized.dice.map(die => Object.freeze({ ...die }))),
			durationMs: Math.max(0, performance.now() - startedAt)
		})
	}

	clear(): void {
		this.#active?.abort()
		this.#active = undefined
		this.#renderer?.clear()
	}

	async updateOptions(options: ViewerOptions): Promise<void> {
		this.#assertUsable()
		let mergedOptions: ViewerOptions = { ...this.#options, ...options }
		if(options.aggressiveThrowChance !== undefined) {
			mergedOptions = { ...mergedOptions, wallBounceChance: options.aggressiveThrowChance }
		} else if(options.wallBounceChance !== undefined) {
			mergedOptions = { ...mergedOptions, aggressiveThrowChance: options.wallBounceChance }
		}
		this.#options = createOptions(mergedOptions)
		validateOptions(this.#options)
		this.#themes.updateOptions(this.#options)
		await this.#renderer?.updateOptions(this.#options)
		if(options.theme) await this.#themes.load(options.theme)
	}

	resize(): void {
		const width = Math.max(1, this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || 300)
		const height = Math.max(1, this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || 150)
		this.#renderer?.resize(width, height)
	}

	dispose(): void {
		if(this.#disposed) return
		this.clear()
		if(this.#resizeHandler) window.removeEventListener('resize', this.#resizeHandler)
		this.#resizeObserver?.disconnect()
		this.#resizeObserver = undefined
		this.#renderer?.dispose()
		this.canvas.remove()
		this.#disposed = true
	}

	async #ensureRenderer(mode: DisplayMode): Promise<DisplayRenderer> {
		if(this.#renderer && this.#rendererMode === mode) return this.#renderer
		this.#renderer?.dispose()
		const renderer = mode === 'physics'
			? new (await import('./renderers/PhysicsRenderer')).PhysicsRenderer()
			: new KinematicRenderer()
		this.#renderer = renderer
		this.#rendererMode = mode
		try {
			await renderer.init({
				canvas: this.canvas,
				options: this.#options,
				loadTheme: theme => this.#themes.load(theme)
			})
			return renderer
		} catch(error) {
			renderer.dispose()
			if(this.#renderer === renderer) {
				this.#renderer = undefined
				this.#rendererMode = undefined
			}
			throw error
		}
	}

	#assertUsable(): void {
		if(this.#disposed) throw new Error('Cannot use a disposed DiceResultViewer.')
	}
}

export default DiceResultViewer
