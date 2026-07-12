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
	readonly wallPadding?: number
	readonly colliderScale?: number
	readonly spawnSpacing?: number
	readonly spawnHeightStep?: number
	readonly friction?: number
	readonly restitution?: number
	readonly linearDamping?: number
	readonly angularDamping?: number
	readonly settleTimeout?: number
	readonly physicsWasmUrl?: string
	readonly onCollision?: (event: CollisionEvent) => void
	readonly onThemeConfigLoaded?: (theme: ResolvedThemeConfig) => void
	readonly onThemeLoaded?: (theme: ResolvedThemeConfig) => void
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
	updateOptions(options: Readonly<RequiredViewerOptions>): Promise<void> | void
	resize(width: number, height: number): void
	clear(): void
	dispose(): void
}

export type RequiredViewerOptions = Required<Omit<ViewerOptions,
	'container' | 'onCollision' | 'onThemeConfigLoaded' | 'onThemeLoaded'
>> & {
	container: string | HTMLElement | null
	onCollision: (event: CollisionEvent) => void
	onThemeConfigLoaded: (theme: ResolvedThemeConfig) => void
	onThemeLoaded: (theme: ResolvedThemeConfig) => void
}
