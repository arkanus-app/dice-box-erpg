import { DisplayCancelledError } from '../errors'
import type { NormalizedResolvedDie, ResolvedThemeConfig } from '../types'

interface ThemeLoaders {
	readonly loadTheme: (theme: string) => Promise<ResolvedThemeConfig>
	readonly loadModel: (config: ResolvedThemeConfig) => Promise<unknown>
	readonly onThemeLoaded: (config: ResolvedThemeConfig) => void
}

/** Shared asset preparation for flat rolls and timelines, including physics. */
export const prepareThemes = async (
	dice: Iterable<Pick<NormalizedResolvedDie, 'theme' | 'sides'>>,
	loaders: ThemeLoaders,
	signal: AbortSignal
): Promise<ReadonlyMap<string, ResolvedThemeConfig>> => {
	const assertActive = (): void => {
		if(signal.aborted) throw new DisplayCancelledError()
	}
	assertActive()
	const needsModel = new Map<string, boolean>()
	for(const die of dice) needsModel.set(die.theme, needsModel.get(die.theme) === true || die.sides !== 2)
	const queue = needsModel.entries()
	const loaded = new Map<string, ResolvedThemeConfig>()
	let failure: { reason: unknown } | undefined
	const worker = async (): Promise<void> => {
		try {
			while(!failure) {
				assertActive()
				const next = queue.next()
				if(next.done) return
				const [theme, modelRequired] = next.value
				const config = await loaders.loadTheme(theme)
				assertActive()
				if(failure) return
				if(modelRequired) await loaders.loadModel(config)
				assertActive()
				loaded.set(theme, config)
			}
		} catch(reason) {
			failure ??= { reason }
		}
	}
	// Bound network/JSON work for requests with many external themes. All
	// started workers settle before an error is returned to the renderer.
	await Promise.all(Array.from({ length: Math.min(4, needsModel.size) }, worker))
	assertActive()
	if(failure) throw failure.reason
	const configs = new Map<string, ResolvedThemeConfig>()
	for(const theme of needsModel.keys()) {
		assertActive()
		const config = loaded.get(theme)!
		configs.set(theme, config)
		loaders.onThemeLoaded(config)
	}
	assertActive()
	return configs
}
