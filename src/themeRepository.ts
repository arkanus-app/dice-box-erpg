import type { CoinTheme, RequiredViewerOptions, ResolvedThemeConfig, ThemeConfig } from './types'

const DEFAULT_COIN_THEME: CoinTheme = Object.freeze({
	front: Object.freeze({ value: 1, texture: 'coin-1.svg' }),
	back: Object.freeze({ value: 2, texture: 'coin-2.svg' }),
	colorize: true,
	edgeColor: '#c89b3c',
	diameter: 1,
	thickness: 0.12
})

const assertThemeConfig = (value: unknown, theme: string): ThemeConfig => {
	if(!value || typeof value !== 'object') {
		throw new Error(`Theme '${theme}' returned an invalid configuration.`)
	}
	const config = value as Partial<ThemeConfig>
	if(!config.material || !Array.isArray(config.diceAvailable)) {
		throw new Error(`Theme '${theme}' must define material and diceAvailable.`)
	}
	return config as ThemeConfig
}

export class ThemeRepository {
	readonly #cache = new Map<string, Promise<ResolvedThemeConfig>>()
	#options: Readonly<RequiredViewerOptions>

	constructor(options: Readonly<RequiredViewerOptions>) {
		this.#options = options
	}

	updateOptions(options: Readonly<RequiredViewerOptions>): void {
		const pathsChanged = options.assetPath !== this.#options.assetPath
			|| options.origin !== this.#options.origin
			|| options.externalThemes !== this.#options.externalThemes
		this.#options = options
		if(pathsChanged) this.#cache.clear()
	}

	load(theme: string): Promise<ResolvedThemeConfig> {
		const cached = this.#cache.get(theme)
		if(cached) return cached
		const pending = this.#fetch(theme)
		this.#cache.set(theme, pending)
		pending.catch(() => this.#cache.delete(theme))
		return pending
	}

	async #fetch(theme: string): Promise<ResolvedThemeConfig> {
		const externalPath = this.#options.externalThemes[theme]
		const basePath = externalPath
			? externalPath.replace(/\/$/, '')
			: `${this.#options.origin}${this.#options.assetPath}themes/${theme}`.replace(/\/$/, '')
		const response = await fetch(`${basePath}/theme.config.json`)
		if(!response.ok) {
			throw new Error(`Unable to fetch config for theme '${theme}' (${response.status} ${response.statusText}).`)
		}
		const raw = assertThemeConfig(await response.json(), theme)
		const meshFile = typeof raw.meshFile === 'string' ? raw.meshFile : 'default.json'
		const meshName = meshFile.replace(/\.[^.]+$/, '')
		const fallbackCoinBase = `${this.#options.origin}${this.#options.assetPath}themes/default`.replace(/\/$/, '')
		const coin = raw.coin ?? {
			...DEFAULT_COIN_THEME,
			front: { ...DEFAULT_COIN_THEME.front, texture: `${fallbackCoinBase}/${DEFAULT_COIN_THEME.front.texture}` },
			back: { ...DEFAULT_COIN_THEME.back, texture: `${fallbackCoinBase}/${DEFAULT_COIN_THEME.back.texture}` }
		}
		const config: ResolvedThemeConfig = Object.freeze({
			...raw,
			theme,
			basePath,
			meshName,
			meshFilePath: typeof raw.meshFile === 'string'
				? `${basePath}/${meshFile}`
				: `${this.#options.origin}${this.#options.assetPath}themes/default/default.json`,
			coin: Object.freeze({
				...coin,
				front: Object.freeze({ ...coin.front }),
				back: Object.freeze({ ...coin.back })
			})
		})
		this.#options.onThemeConfigLoaded(config)
		return config
	}
}

export { DEFAULT_COIN_THEME }
