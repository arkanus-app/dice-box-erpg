export type DiceSides = 2 | 4 | 6 | 8 | 10 | 12 | 20 | 100

export type DisplayMode = 'kinematic' | 'physics'

export interface CoinFaceTheme {
	readonly value: 1 | 2
	readonly texture: string
}

export interface CoinTheme {
	readonly front: CoinFaceTheme
	readonly back: CoinFaceTheme
	readonly edgeColor?: string
	readonly diameter?: number
	readonly thickness?: number
}

export interface ResolvedDie {
	readonly id: string
	readonly sides: DiceSides
	readonly value: number
	readonly discarded?: boolean
	readonly theme?: string
	readonly themeColor?: string
}

export interface DisplayRequest {
	readonly id: string
	readonly dice: readonly ResolvedDie[]
	readonly seed?: string
	readonly mode?: DisplayMode
}

export interface DisplayResult {
	readonly id: string
	readonly dice: readonly ResolvedDie[]
	readonly durationMs: number
}

export interface TimelineEffectOptions {
	readonly enabled?: boolean
	readonly delayMs?: number
	readonly durationMs?: number
	readonly intensity?: number
	readonly color?: string
}

export interface TimelineExplodeEffectOptions extends TimelineEffectOptions {
	readonly origin?: 'source' | 'edge'
	readonly burstHeight?: number
	readonly spread?: number
}

export interface TimelineRerollEffectOptions extends TimelineEffectOptions {
	readonly style?: 'hop' | 'edge' | 'spin'
	readonly hopHeight?: number
}

export interface TimelineBadgeEffectOptions extends TimelineEffectOptions {
	readonly showBadge?: boolean
}

export interface TimelineCriticalEffectOptions extends TimelineEffectOptions {
	readonly pulses?: number
}

export interface TimelineEffectsOptions {
	readonly explode?: TimelineExplodeEffectOptions
	readonly compound?: TimelineBadgeEffectOptions
	readonly penetrate?: TimelineBadgeEffectOptions
	readonly reroll?: TimelineRerollEffectOptions
	readonly unique?: TimelineRerollEffectOptions
	readonly keep?: TimelineEffectOptions
	readonly drop?: TimelineEffectOptions
	readonly success?: TimelineEffectOptions
	readonly failure?: TimelineEffectOptions
	readonly neutral?: TimelineEffectOptions
	readonly criticalSuccess?: TimelineCriticalEffectOptions
	readonly criticalFailure?: TimelineCriticalEffectOptions
}

export interface TimelineOptions {
	readonly enabled?: boolean
	readonly maxEvents?: number
	readonly maxDurationMs?: number
	readonly phaseGapMs?: number
	readonly effects?: TimelineEffectsOptions
}

export interface NormalizedTimelineEffectOptions {
	readonly enabled: boolean
	readonly delayMs: number
	readonly durationMs: number
	readonly intensity: number
	readonly color: string
}

export interface NormalizedTimelineExplodeEffectOptions extends NormalizedTimelineEffectOptions {
	readonly origin: 'source' | 'edge'
	readonly burstHeight: number
	readonly spread: number
}

export interface NormalizedTimelineRerollEffectOptions extends NormalizedTimelineEffectOptions {
	readonly style: 'hop' | 'edge' | 'spin'
	readonly hopHeight: number
}

export interface NormalizedTimelineBadgeEffectOptions extends NormalizedTimelineEffectOptions {
	readonly showBadge: boolean
}

export interface NormalizedTimelineCriticalEffectOptions extends NormalizedTimelineEffectOptions {
	readonly pulses: number
}

export interface NormalizedTimelineOptions {
	readonly enabled: boolean
	readonly maxEvents: number
	readonly maxDurationMs: number
	readonly phaseGapMs: number
	readonly effects: {
		readonly explode: NormalizedTimelineExplodeEffectOptions
		readonly compound: NormalizedTimelineBadgeEffectOptions
		readonly penetrate: NormalizedTimelineBadgeEffectOptions
		readonly reroll: NormalizedTimelineRerollEffectOptions
		readonly unique: NormalizedTimelineRerollEffectOptions
		readonly keep: NormalizedTimelineEffectOptions
		readonly drop: NormalizedTimelineEffectOptions
		readonly success: NormalizedTimelineEffectOptions
		readonly failure: NormalizedTimelineEffectOptions
		readonly neutral: NormalizedTimelineEffectOptions
		readonly criticalSuccess: NormalizedTimelineCriticalEffectOptions
		readonly criticalFailure: NormalizedTimelineCriticalEffectOptions
	}
}

export interface TimelineDieDefinition {
	readonly id: string
	readonly sides: DiceSides
	readonly theme?: string
	readonly themeColor?: string
}

interface DiceTimelineEventBase {
	readonly sequence: number
	readonly subject?: 'die'
	readonly dieId: string
	readonly parentDieId: string | null
	readonly rollIndex: number
	readonly sourceNodeId: string
}

export interface RollTimelineEvent extends DiceTimelineEventBase {
	readonly type: 'roll'
	readonly value: number
}

export interface RerollTimelineEvent extends DiceTimelineEventBase {
	readonly type: 'reroll'
	readonly from: number
	readonly to: number
	readonly reason: 'reroll' | 'reroll-once' | 'unique' | 'unique-once'
}

export interface ExplodeTimelineEvent extends DiceTimelineEventBase {
	readonly type: 'explode'
	readonly childDieId: string
	readonly value: number
	readonly reason: 'explode' | 'compound' | 'penetrate'
}

export interface TransformTimelineEvent extends DiceTimelineEventBase {
	readonly type: 'transform'
	readonly from: number
	readonly to: number
	readonly reason: 'minimum' | 'maximum' | 'penetrate' | 'compound'
}

export interface IncludeTimelineEvent extends DiceTimelineEventBase {
	readonly type: 'include'
	readonly contribution: number
}

export interface ExcludeTimelineEvent extends DiceTimelineEventBase {
	readonly type: 'exclude'
	readonly reason: 'drop' | 'keep' | 'compound-absorbed'
}

export interface ClassifyTimelineEvent extends DiceTimelineEventBase {
	readonly type: 'classify'
	readonly outcome: 'success' | 'failure' | 'neutral' | 'critical-success' | 'critical-failure'
}

export type DiceTimelineEvent =
	| RollTimelineEvent
	| RerollTimelineEvent
	| ExplodeTimelineEvent
	| TransformTimelineEvent
	| IncludeTimelineEvent
	| ExcludeTimelineEvent
	| ClassifyTimelineEvent

export interface DisplayTimelineRequest {
	readonly id: string
	readonly dice: readonly TimelineDieDefinition[]
	readonly events: readonly DiceTimelineEvent[]
	readonly seed?: string
	readonly mode?: DisplayMode
}

export interface DisplayTimelineResult extends DisplayResult {
	readonly eventCount: number
	readonly phaseCount: number
	readonly degraded: boolean
}

export interface ThemeMaterialConfig {
	readonly type: 'color' | 'standard'
	readonly diffuseTexture?: string | Readonly<{ light: string; dark: string }>
	readonly bumpTexture?: string
	readonly specularTexture?: string
	readonly diffuseLevel?: number
	readonly bumpLevel?: number
	readonly specularPower?: number
}

export interface ThemeConfig {
	readonly name?: string
	readonly systemName?: string
	readonly extends?: string
	readonly meshFile?: string
	readonly material: ThemeMaterialConfig
	readonly diceAvailable: readonly string[]
	readonly coin?: CoinTheme
	readonly [key: string]: unknown
}

export interface CollisionEvent {
	readonly action: 'collision'
	readonly body0Id?: string
	readonly body1Id?: string
	readonly force: number
}

export interface ViewerOptions {
	readonly id?: string
	readonly container?: string | HTMLElement | null
	readonly assetPath?: string
	readonly origin?: string
	readonly mode?: DisplayMode
	readonly theme?: string
	readonly preloadThemes?: readonly string[]
	readonly externalThemes?: Readonly<Record<string, string>>
	readonly themeColor?: string
	readonly maxDice?: number
	readonly enableShadows?: boolean
	readonly shadowTransparency?: number
	readonly shadowResolution?: number
	readonly lightIntensity?: number
	readonly antialias?: boolean
	readonly scale?: number
	readonly duration?: number
	readonly delay?: number
	readonly gravity?: number
	readonly mass?: number
	readonly startingHeight?: number
	readonly spinForce?: number
	readonly throwForce?: number
	/** Seeded per-presentation chance (0..1) of using the high-energy launch tail. */
	readonly aggressiveThrowChance?: number
	/** @deprecated Use aggressiveThrowChance. This never guarantees a wall collision. */
	readonly wallBounceChance?: number
	readonly wallPadding?: number
	readonly colliderScale?: number
	readonly spawnSpacing?: number
	readonly spawnHeightStep?: number
	/** Extra off-screen margin, expressed as a fraction of the body radius. */
	readonly spawnOverscan?: number
	readonly friction?: number
	readonly restitution?: number
	readonly linearDamping?: number
	readonly angularDamping?: number
	readonly settleTimeout?: number
	readonly physicsWasmUrl?: string
	readonly onCollision?: (event: CollisionEvent) => void
	readonly onThemeConfigLoaded?: (theme: ResolvedThemeConfig) => void
	readonly onThemeLoaded?: (theme: ResolvedThemeConfig) => void
	readonly timeline?: TimelineOptions
}

export interface NormalizedResolvedDie extends Required<Pick<ResolvedDie, 'id' | 'sides' | 'value' | 'discarded' | 'theme' | 'themeColor'>> {}

export interface NormalizedDisplayRequest {
	readonly id: string
	readonly dice: readonly NormalizedResolvedDie[]
	readonly seed: string
	readonly mode: DisplayMode
}

export interface ResolvedThemeConfig extends ThemeConfig {
	readonly theme: string
	readonly basePath: string
	readonly meshName: string
	readonly meshFilePath: string
	readonly coin: CoinTheme
}

export interface RendererContext {
	readonly canvas: HTMLCanvasElement
	readonly options: Readonly<RequiredViewerOptions>
	readonly loadTheme: (theme: string) => Promise<ResolvedThemeConfig>
}

export interface DisplayRenderer {
	readonly mode: DisplayMode
	init(context: RendererContext): Promise<void>
	display(request: NormalizedDisplayRequest, signal: AbortSignal): Promise<void>
	displayTimeline(plan: import('./timeline').DiceTimelinePlan, signal: AbortSignal): Promise<void>
	updateOptions(options: Readonly<RequiredViewerOptions>): Promise<void> | void
	resize(width: number, height: number): void
	clear(): void
	dispose(): void
}

export type RequiredViewerOptions = Required<Omit<ViewerOptions,
	'container' | 'onCollision' | 'onThemeConfigLoaded' | 'onThemeLoaded' | 'timeline'
>> & {
	container: string | HTMLElement | null
	onCollision: (event: CollisionEvent) => void
	onThemeConfigLoaded: (theme: ResolvedThemeConfig) => void
	onThemeLoaded: (theme: ResolvedThemeConfig) => void
	timeline: NormalizedTimelineOptions
}
