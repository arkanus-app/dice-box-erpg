const SUPPORTED_DICE = new Set([4, 6, 8, 10, 12, 20, 100])
const SUPPORTED_FORCED_RESULT_MODES = new Set(['physics', 'visual'])

export const normalizeDisplaySides = (sides) => {
	const normalized = Number(sides)
	if(!SUPPORTED_DICE.has(normalized)) {
		throw new Error(`Unsupported display die: d${sides}. Supported dice are d4, d6, d8, d10, d12, d20, and d100.`)
	}
	return normalized
}

export const normalizeDisplayValue = (value, sides) => {
	const normalized = Number(value)
	if(!Number.isFinite(normalized) || !Number.isInteger(normalized)) {
		throw new Error(`Display die d${sides} is missing an integer value.`)
	}
	if(normalized < 1 || normalized > sides) {
		throw new Error(`Display die d${sides} value ${normalized} is outside 1-${sides}.`)
	}
	return normalized
}

export const normalizeForcedResultMode = (value, fallback = 'physics') => {
	const mode = value ?? fallback
	if(!SUPPORTED_FORCED_RESULT_MODES.has(mode)) {
		throw new Error(`Invalid forcedResultMode '${mode}'. Supported modes are 'physics' and 'visual'.`)
	}
	return mode
}

export const normalizeDisplayRollRequest = (request = {}, defaults = {}) => {
	if(!request || typeof request !== 'object') {
		throw new Error('displayRoll expects a request object.')
	}
	if(!Array.isArray(request.dice) || request.dice.length === 0) {
		throw new Error('displayRoll expects at least one resolved die.')
	}

	const theme = request.theme || defaults.theme || 'default'
	const themeColor = request.themeColor || defaults.themeColor || '#2e8555'
	const id = request.id || `display-roll-${Date.now()}`
	const forcedResultMode = normalizeForcedResultMode(request.forcedResultMode, defaults.forcedResultMode)

	return {
		id,
		seed: typeof request.seed === 'string' ? request.seed : id,
		theme,
		themeColor,
		forcedResultMode,
		dice: request.dice.map((die, index) => {
			if(!die || typeof die !== 'object') {
				throw new Error(`Display die at index ${index} must be an object.`)
			}

			const sides = normalizeDisplaySides(die.sides)
			const value = normalizeDisplayValue(die.value, sides)
			const dieTheme = die.theme || theme
			const dieThemeColor = die.themeColor || themeColor
			const dieForcedResultMode = normalizeForcedResultMode(die.forcedResultMode, forcedResultMode)

			return {
				id: die.id || `${id}-die-${index}`,
				index,
				sides,
				value,
				faceValue: sides === 100 ? Math.floor((value - 1) / 10) * 10 : value,
				discarded: Boolean(die.discarded),
				theme: dieTheme,
				themeColor: dieThemeColor,
				forcedResultMode: dieForcedResultMode
			}
		})
	}
}

export const getDisplayDieBodyCount = (die) => {
	return Number(die?.sides) === 100 ? 2 : 1
}

export const getDisplayRollBodyCount = (dice) => {
	return dice.reduce((total, die) => total + getDisplayDieBodyCount(die), 0)
}

export const toDisplayRollResult = (request, dice) => ({
	id: request.id,
	dice: dice.map(({collectionId, groupId, id, meshName, rollId, ...die}) => die)
})
