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
	readonly physicsCollider?: Mesh
	readonly sides: number
	readonly start: Vector3
	readonly end: Vector3
	readonly supportHeight: number
	readonly target: Quaternion
	readonly spinX: number
	readonly spinY: number
	readonly spinZ: number
}

const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3)
const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

interface TrajectoryLayoutInput {
	readonly index: number
	readonly count: number
	readonly scale: number
	readonly startingHeight: number
	readonly coin: boolean
}

export const createScatteredLanding = (
	input: TrajectoryLayoutInput,
	random: ReturnType<typeof createSeededRandom>
): Vector3 => {
	const naturalSpacing = Math.max(0.78, input.scale * (input.coin ? 0.25 : 0.29))
	const fittedSpacing = Math.min(naturalSpacing, 7.2 / Math.sqrt(Math.max(1, input.count)))
	const radius = input.count === 1
		? random.range(0.15, 0.55)
		: fittedSpacing * Math.sqrt(input.index + 0.65)
	const angle = input.index * GOLDEN_ANGLE + random.range(-0.38, 0.38)
	const jitter = fittedSpacing * 0.16
	return new Vector3(
		Math.cos(angle) * radius + random.range(-jitter, jitter),
		input.coin ? input.scale * 0.01 : input.scale * 0.12,
		Math.sin(angle) * radius + random.range(-jitter, jitter)
	)
}

export const createSideLaunch = (
	input: TrajectoryLayoutInput,
	landing: Vector3,
	random: ReturnType<typeof createSeededRandom>
): Vector3 => {
	const fromLeft = input.index % 2 === 0
	const sideInset = Math.min(1.35, input.scale * (input.coin ? 0.12 : 0.16))
	const sideX = 8.65 - sideInset + random.range(-0.22, 0.22)
	const launchHeight = Math.min(
		input.startingHeight,
		Math.max(2.8, input.scale * 0.68 + random.range(0.45, 1.25))
	)
	return new Vector3(
		(fromLeft ? -1 : 1) * sideX,
		launchHeight,
		Math.max(-3.6, Math.min(3.6, landing.z * 0.35 + random.range(-2.4, 2.4)))
	)
}

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
		return this.createTrajectory(
			coin.root,
			coin.targetQuaternion,
			index,
			count,
			random,
			true,
			2,
			coin.supportHeight
		)
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
		const instance = await this.polyhedra!.create(
			theme,
			die,
			sides,
			faceValue,
			id,
			this.options!.scale,
			this.options!.colliderScale
		)
		this.environment?.addShadowCaster(instance.mesh)
		this.activeNodes.push(instance.mesh)
		return this.createTrajectory(
			instance.mesh,
			instance.targetQuaternion,
			index,
			count,
			random,
			false,
			sides,
			instance.supportHeight,
			instance.physicsCollider
		)
	}

	protected createTrajectory(
		node: AbstractMesh | TransformNode,
		canonicalTarget: Quaternion,
		index: number,
		count: number,
		random: ReturnType<typeof createSeededRandom>,
		coin: boolean,
		sides: number,
		supportHeight: number,
		physicsCollider?: Mesh
	): VisualEntry {
		const layout = {
			index,
			count,
			scale: this.options!.scale,
			startingHeight: this.options!.startingHeight,
			coin
		}
		const end = createScatteredLanding(layout, random)
		end.y = supportHeight
		const start = createSideLaunch(layout, end, random)
		const target = Quaternion.RotationAxis(Vector3.Up(), random.range(-Math.PI, Math.PI))
			.multiply(canonicalTarget)
			.normalize()
		node.position.copyFrom(start)
		node.rotationQuaternion = Quaternion.Identity()
		return {
			node,
			...(physicsCollider ? { physicsCollider } : {}),
			sides,
			start,
			end,
			supportHeight,
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
