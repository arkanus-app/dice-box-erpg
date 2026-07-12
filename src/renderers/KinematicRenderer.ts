import { Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { Engine } from '@babylonjs/core/Engines/engine'
import type { Scene } from '@babylonjs/core/scene'
import type { ResolvedThemeConfig, DisplayMode, DisplayRenderer, NormalizedDisplayRequest, RendererContext, RequiredViewerOptions } from '../types'
import { DisplayCancelledError } from '../errors'
import { createSeededRandom } from '../random'
import { CoinFactory } from './coin'
import { PolyhedralFactory } from './PolyhedralFactory'
import { SceneEnvironment } from './sceneEnvironment'

export interface VisualEntry {
	readonly node: AbstractMesh | TransformNode
	readonly start: Vector3
	readonly end: Vector3
	readonly target: Quaternion
	readonly spinX: number
	readonly spinY: number
	readonly spinZ: number
}

const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3)
const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

export class KinematicRenderer implements DisplayRenderer {
	readonly mode: DisplayMode = 'kinematic'
	protected context?: RendererContext
	protected options?: Readonly<RequiredViewerOptions>
	protected engine?: Engine
	protected scene?: Scene
	protected environment?: SceneEnvironment
	protected polyhedra?: PolyhedralFactory
	protected coinFactory?: CoinFactory
	protected readonly activeNodes: Array<AbstractMesh | TransformNode> = []
	protected initialized = false

	async init(context: RendererContext): Promise<void> {
		if(this.initialized) return
		this.context = context
		this.options = context.options
		const width = Math.max(1, context.canvas.clientWidth || context.canvas.parentElement?.clientWidth || 300)
		const height = Math.max(1, context.canvas.clientHeight || context.canvas.parentElement?.clientHeight || 150)
		context.canvas.width = width
		context.canvas.height = height
		this.environment = new SceneEnvironment(context.canvas, context.options)
		this.engine = this.environment.engine
		this.scene = this.environment.scene
		this.polyhedra = new PolyhedralFactory(this.scene)
		this.coinFactory = new CoinFactory(this.scene)
		this.scene.render()
		this.initialized = true
	}

	async display(request: NormalizedDisplayRequest, signal: AbortSignal): Promise<void> {
		this.assertReady()
		this.clear()
		if(signal.aborted) throw new DisplayCancelledError()
		const configs = new Map<string, ResolvedThemeConfig>()
		for(const theme of new Set(request.dice.map(die => die.theme))) {
			const config = await this.context!.loadTheme(theme)
			configs.set(theme, config)
			if(request.dice.some(die => die.theme === theme && die.sides !== 2)) {
				await this.ensurePolyhedralTheme(config)
			}
			this.options!.onThemeLoaded(config)
		}
		if(signal.aborted) throw new DisplayCancelledError()
		const random = createSeededRandom(request.seed)
		const entries: VisualEntry[] = []
		const bodyCount = request.dice.reduce((count, die) => count + (die.sides === 100 ? 2 : 1), 0)
		let bodyIndex = 0
		for(const die of request.dice) {
			const theme = configs.get(die.theme)!
			if(die.sides === 2) {
				entries.push(this.createCoinEntry(theme, die.id, die.value, die.discarded, bodyIndex++, bodyCount, random))
				continue
			}
			if(die.sides === 100) {
				const tens = Math.floor((die.value - 1) / 10) * 10
				const ones = die.value - tens
				entries.push(await this.createDieEntry(theme, die, 100, tens, `${die.id}-tens`, bodyIndex++, bodyCount, random))
				entries.push(await this.createDieEntry(theme, die, 10, ones, `${die.id}-ones`, bodyIndex++, bodyCount, random))
				continue
			}
			entries.push(await this.createDieEntry(theme, die, die.sides, die.value, die.id, bodyIndex++, bodyCount, random))
		}
		await this.animate(entries, signal)
	}

	protected async ensurePolyhedralTheme(config: ResolvedThemeConfig): Promise<void> {
		await this.polyhedra!.load(config)
	}

	protected createCoinEntry(
		theme: ResolvedThemeConfig,
		id: string,
		value: number,
		discarded: boolean,
		index: number,
		count: number,
		random: ReturnType<typeof createSeededRandom>
	): VisualEntry {
		const coin = this.coinFactory!.create(theme, id, value, this.options!.scale, discarded)
		this.activeNodes.push(coin.root)
		for(const mesh of coin.meshes) this.environment?.addShadowCaster(mesh)
		return this.createTrajectory(coin.root, coin.targetQuaternion, index, count, random, true)
	}

	protected async createDieEntry(
		theme: ResolvedThemeConfig,
		die: NormalizedDisplayRequest['dice'][number],
		sides: number,
		faceValue: number,
		id: string,
		index: number,
		count: number,
		random: ReturnType<typeof createSeededRandom>
	): Promise<VisualEntry> {
		const instance = await this.polyhedra!.create(theme, die, sides, faceValue, id, this.options!.scale)
		this.environment?.addShadowCaster(instance.mesh)
		this.activeNodes.push(instance.mesh)
		return this.createTrajectory(instance.mesh, instance.targetQuaternion, index, count, random, false)
	}

	protected createTrajectory(
		node: AbstractMesh | TransformNode,
		target: Quaternion,
		index: number,
		count: number,
		random: ReturnType<typeof createSeededRandom>,
		coin: boolean
	): VisualEntry {
		const columns = Math.max(1, Math.ceil(Math.sqrt(count)))
		const rows = Math.ceil(count / columns)
		const spacing = Math.max(0.7, this.options!.scale * 0.28)
		const column = index % columns
		const row = Math.floor(index / columns)
		const end = new Vector3(
			(column - (columns - 1) / 2) * spacing,
			coin ? this.options!.scale * 0.01 : this.options!.scale * 0.12,
			(row - (rows - 1) / 2) * spacing
		)
		const fromLeft = index % 2 === 0
		const start = new Vector3(
			(fromLeft ? -1 : 1) * (4.5 + random.range(0, 1.5)),
			this.options!.startingHeight + random.range(0, 1.5),
			random.range(-3, 3)
		)
		node.position.copyFrom(start)
		node.rotationQuaternion = Quaternion.Identity()
		return {
			node,
			start,
			end,
			target,
			spinX: random.range(coin ? 8 : 3, coin ? 14 : 7) * Math.PI,
			spinY: random.range(2, 7) * Math.PI,
			spinZ: random.range(2, 7) * Math.PI
		}
	}

	protected animate(entries: readonly VisualEntry[], signal: AbortSignal): Promise<void> {
		const engine = this.engine!
		const scene = this.scene!
		const duration = Math.max(250, this.options!.duration + Math.max(0, entries.length - 1) * this.options!.delay)
		const startedAt = performance.now()
		return new Promise<void>((resolve, reject) => {
			let settled = false
			const finish = (error?: unknown): void => {
				if(settled) return
				settled = true
				engine.stopRenderLoop(render)
				signal.removeEventListener('abort', abort)
				if(error) reject(error)
				else resolve()
			}
			const abort = (): void => finish(new DisplayCancelledError())
			const render = (): void => {
				if(signal.aborted) return abort()
				const progress = clamp01((performance.now() - startedAt) / duration)
				const positionProgress = easeOutCubic(progress)
				for(const entry of entries) {
					entry.node.position.set(
						entry.start.x + (entry.end.x - entry.start.x) * positionProgress,
						entry.start.y + (entry.end.y - entry.start.y) * positionProgress + Math.sin(progress * Math.PI) * 2.4,
						entry.start.z + (entry.end.z - entry.start.z) * positionProgress
					)
					const spinning = Quaternion.RotationYawPitchRoll(
						entry.spinY * progress,
						entry.spinX * progress,
						entry.spinZ * progress
					)
					const settle = easeOutCubic(clamp01((progress - 0.68) / 0.32))
					entry.node.rotationQuaternion = Quaternion.Slerp(spinning, entry.target, settle)
				}
				scene.render()
				if(progress >= 1) finish()
			}
			signal.addEventListener('abort', abort, { once: true })
			engine.runRenderLoop(render)
		})
	}

	async updateOptions(options: Readonly<RequiredViewerOptions>): Promise<void> {
		this.options = options
		this.environment?.update(options)
	}

	resize(width: number, height: number): void {
		if(!this.context || !this.engine) return
		this.context.canvas.width = Math.max(1, width)
		this.context.canvas.height = Math.max(1, height)
		this.environment?.resize()
	}

	clear(): void {
		this.engine?.stopRenderLoop()
		for(const node of this.activeNodes.splice(0)) {
			if(node.metadata?.displayFactory === 'coin') this.coinFactory?.release(node)
			else if(node instanceof Mesh && node.metadata?.displayFactory === 'polyhedron') this.polyhedra?.release(node)
			else node.dispose(false, false)
		}
		this.scene?.render()
	}

	dispose(): void {
		this.clear()
		this.coinFactory?.dispose()
		this.polyhedra?.dispose()
		this.environment?.dispose()
		this.initialized = false
	}

	protected assertReady(): void {
		if(!this.initialized || !this.scene || !this.engine || !this.options || !this.context) {
			throw new Error('Renderer must be initialized before display().')
		}
	}
}

export default KinematicRenderer
