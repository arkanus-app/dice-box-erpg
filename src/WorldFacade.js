import { createCanvas } from './components/world/canvas'
import { debounce, hexToRGB, webgl_support } from './helpers'
import {
	getDisplayRollBodyCount,
	normalizeDisplayRollRequest,
	toDisplayRollResult
} from './displayRoll'

const defaultOptions = {
	id: `dice-canvas-${Date.now()}`,
	container: null,
	enableShadows: true,
	shadowTransparency: .8,
	lightIntensity: 1,
	delay: 10,
	scale: 5,
	theme: 'default',
	preloadThemes: [],
	externalThemes: {},
	themeColor: '#2e8555',
	offscreen: false,
	assetPath: '/assets/dice-box/',
	origin: typeof window !== 'undefined' ? window.location.origin : '',
	maxDice: 999,
	antialias: true,
	shadowResolution: 1024,
	gravity: 1.85,
	mass: 1.08,
	startingHeight: 6.4,
	spinForce: 5.8,
	throwForce: 4.55,
	wallPadding: 1.35,
	friction: .86,
	restitution: .16,
	linearDamping: .28,
	angularDamping: .24,
	settleTimeout: 4200,
	forcedResultMode: 'physics'
}

class WorldFacade {
	rollCollectionData = {}
	rollDiceData = {}
	themesLoadedData = {}
	#collectionIndex = 0
	#rollIndex = 0
	#idIndex = 0
	#activeRollToken = 0
	#DiceWorld = {}
	#diceWorldPromise
	#diceWorldResolve
	#resizeHandler
	#webgl_support = true
	#disposed = false
	#themeConfigPromises = new Map()
	#themeLoadPromises = new Map()
	#colorSuffixCache = new Map()
	noop = () => {}

	constructor(options = {}) {
		if(typeof options !== 'object') {
			throw new Error('DiceBox config options must be an object.')
		}

		const { onCollision, onThemeConfigLoaded, onThemeLoaded, ...boxOptions } = options
		this.config = {...defaultOptions, ...boxOptions}

		this.onThemeLoaded = onThemeLoaded || this.noop
		this.onThemeConfigLoaded = onThemeConfigLoaded || this.noop
		this.onCollision = onCollision || this.noop

		this.canvas = createCanvas({
			selector: this.config.container,
			id: this.config.id
		})
		this.isVisible = true

		if(!webgl_support()) {
			this.#webgl_support = false
		}
		if(boxOptions.offscreen === undefined) {
			this.config.offscreen = this.#supportsOffscreenCanvas()
		}
		this.config.maxDice = this.#normalizeMaxDice(this.config.maxDice)
	}

	async #loadWorld() {
		this.#diceWorldPromise = new Promise((resolve) => {
			this.#diceWorldResolve = resolve
		})

		const onInitComplete = () => {
			this.#diceWorldResolve()
		}

		const sharedOptions = {
			canvas: this.canvas,
			options: this.config,
			onInitComplete,
			onCollision: event => this.onCollision(event)
		}

		if(!this.#webgl_support) {
			const WorldNone = await import('./components/world.none').then(module => module.default)
			this.#DiceWorld = new WorldNone(sharedOptions)
		} else if('OffscreenCanvas' in window && 'transferControlToOffscreen' in this.canvas && this.config.offscreen) {
			const WorldOffscreen = await import('./components/world.offscreen').then(module => module.default)
			this.#DiceWorld = new WorldOffscreen(sharedOptions)
		} else {
			if(this.config.offscreen) {
				console.warn('This browser does not support OffscreenCanvas. Using standard canvas fallback.')
				this.config.offscreen = false
			}
			const WorldOnscreen = await import('./components/world.onscreen').then(module => module.default)
			this.#DiceWorld = new WorldOnscreen(sharedOptions)
		}
	}

	resizeWorld() {
		const resizeWorkers = () => {
			if(this.#disposed || !this.canvas) {
				return
			}
			this.#DiceWorld.resize({width: this.canvas.clientWidth, height: this.canvas.clientHeight})
		}

		if(this.#resizeHandler) {
			window.removeEventListener('resize', this.#resizeHandler)
		}
		this.#resizeHandler = debounce(resizeWorkers)
		window.addEventListener('resize', this.#resizeHandler)
	}

	async init() {
		if(this.#disposed) {
			throw new Error('Cannot init a disposed DiceBox.')
		}

		await this.#loadWorld()
		this.resizeWorld()

		this.#DiceWorld.onRollResult = (result) => {
			this.#handleDieComplete(result)
		}
		this.#DiceWorld.onRollError = (error) => {
			this.#handleRollError(error)
		}

		await Promise.all([this.#diceWorldPromise])
		await this.#loadThemes([this.config.theme, ...this.config.preloadThemes])

		return this
	}

	async getThemeConfig(theme) {
		if(this.themesLoadedData[theme]) {
			return this.themesLoadedData[theme]
		}

		const pendingConfig = this.#themeConfigPromises.get(theme)
		if(pendingConfig) {
			return pendingConfig
		}

		const configPromise = this.#resolveThemeConfig(theme)
		this.#themeConfigPromises.set(theme, configPromise)

		try {
			return await configPromise
		} finally {
			this.#themeConfigPromises.delete(theme)
		}
	}

	async #resolveThemeConfig(theme) {
		let basePath = `${this.config.origin}${this.config.assetPath}themes/${theme}`

		if(this.config.externalThemes[theme]) {
			basePath = this.config.externalThemes[theme]
		}

		const themeData = await fetch(`${basePath}/theme.config.json`).then(resp => {
			if(resp.ok) {
				const contentType = resp.headers.get('content-type')
				if(contentType && contentType.indexOf('application/json') !== -1) {
					return resp.json()
				}
				if(resp.type && resp.type === 'basic') {
					return resp.json()
				}
				throw new Error(`Incorrect contentType: ${contentType}. Expected "application/json" or "basic"`)
			}
			throw new Error(`Unable to fetch config file for theme: '${theme}'. Request rejected with status ${resp.status}: ${resp.statusText}`)
		})

		if(!themeData) {
			throw new Error('No theme config data to work with.')
		}

		let meshName = 'default'
		let meshFilePath = `${this.config.origin}${this.config.assetPath}themes/default/default.json`

		if(themeData.hasOwnProperty('meshFile')) {
			meshName = themeData.meshFile.replace(/(.*)\..{2,4}$/, '$1')
			meshFilePath = `${basePath}/${themeData.meshFile}`
		}

		if(!themeData.hasOwnProperty('diceAvailable')) {
			throw new Error('A theme must define "diceAvailable".')
		}

		if(themeData.hasOwnProperty('extends')) {
			const target = await this.loadTheme(themeData.extends)
			if(target.hasOwnProperty('extends')) {
				throw new Error('Cannot extend a theme that extends another theme.')
			}

			const newDice = {}
			themeData.diceAvailable.forEach(die => {
				newDice[die] = themeData.systemName
			})
			target.diceExtended = {...target.diceExtended, ...newDice}
			target.diceExtendedSet = new Set(Object.keys(target.diceExtended))
			this.config.theme = themeData.extends
		}

		Object.assign(themeData, {
			basePath,
			meshFilePath,
			meshName,
			theme,
			diceAvailableSet: new Set(themeData.diceAvailable || []),
			diceExtended: themeData.diceExtended || {},
			diceExtendedSet: new Set(Object.keys(themeData.diceExtended || {}))
		})

		return themeData
	}

	async loadTheme(theme) {
		if(this.themesLoadedData[theme]) {
			return this.themesLoadedData[theme]
		}

		const pendingLoad = this.#themeLoadPromises.get(theme)
		if(pendingLoad) {
			return pendingLoad
		}

		const loadPromise = this.#loadTheme(theme)
		this.#themeLoadPromises.set(theme, loadPromise)

		try {
			return await loadPromise
		} catch(error) {
			delete this.themesLoadedData[theme]
			throw error
		} finally {
			this.#themeLoadPromises.delete(theme)
		}
	}

	async #loadTheme(theme) {
		const themeConfig = await this.getThemeConfig(theme)
		this.themesLoadedData[theme] = themeConfig
		this.onThemeConfigLoaded(themeConfig)
		await this.#DiceWorld.loadTheme(themeConfig)
		this.onThemeLoaded(themeConfig)
		return themeConfig
	}

	async updateConfig(options = {}) {
		const newConfig = {...this.config, ...options}
		if(options.maxDice !== undefined) {
			newConfig.maxDice = this.#normalizeMaxDice(options.maxDice)
		}
		if(options.offscreen === undefined && !('offscreen' in options)) {
			newConfig.offscreen = this.config.offscreen
		}

		this.config = newConfig

		if(options.theme) {
			const themeData = await this.loadTheme(newConfig.theme)
			if(themeData.hasOwnProperty('extends')) {
				this.config.theme = themeData.extends
			}
		}

		this.#DiceWorld.updateConfig(newConfig)
	}

	clear() {
		this.#activeRollToken++
		Object.values(this.rollCollectionData).forEach(collection => {
			collection.reject(new Error('Display roll was cleared before completion.'))
		})
		this.#resetRollState()
		this.#DiceWorld.clear?.()
	}

	dispose() {
		if(this.#disposed) {
			return
		}
		this.clear()
		this.#disposed = true

		if(this.#resizeHandler) {
			window.removeEventListener('resize', this.#resizeHandler)
			this.#resizeHandler = null
		}

		this.#DiceWorld.dispose?.()
	}

	hide(className) {
		if(className) {
			this.canvas.dataset.hideClass = className
			this.canvas.classList.add(className)
		} else {
			this.canvas.style.display = 'none'
		}
		this.isVisible = false
	}

	show() {
		const hideClass = this.canvas.dataset?.hideClass
		if(hideClass) {
			delete this.canvas.dataset.hideClass
			this.canvas.classList.remove(hideClass)
		} else {
			this.canvas.style.display = 'block'
		}
		this.isVisible = true
		this.resizeWorld()
	}

	async displayRoll(request) {
		if(this.#disposed) {
			throw new Error('Cannot display a roll after DiceBox.dispose().')
		}

		const normalizedRequest = normalizeDisplayRollRequest(request, this.config)
		const requestedBodies = getDisplayRollBodyCount(normalizedRequest.dice)
		if(requestedBodies > this.config.maxDice) {
			throw new Error(`Display roll exceeds maxDice (${this.config.maxDice}). Requested ${requestedBodies} dice bodies.`)
		}

		this.clear()
		const collectionId = this.#collectionIndex++
		const token = this.#activeRollToken
		const collection = new Collection({
			id: collectionId,
			token,
			request: normalizedRequest,
			rolls: []
		})
		this.rollCollectionData[collectionId] = collection

		this.#startDisplayRoll(collectionId).catch(error => {
			const activeCollection = this.rollCollectionData[collectionId]
			if(activeCollection && activeCollection.token === token) {
				activeCollection.reject(error)
				delete this.rollCollectionData[collectionId]
			}
		})

		return collection.promise
	}

	async #startDisplayRoll(collectionId) {
		const collection = this.rollCollectionData[collectionId]
		if(!collection) {
			return
		}

		const themeNames = new Set(collection.request.dice.map(die => die.theme))
		themeNames.add(collection.request.theme)
		await this.#loadThemes(themeNames)

		if(collection.token !== this.#activeRollToken) {
			return
		}

		await this.#makeDisplayRoll(collection)
	}

	async #makeDisplayRoll(collection) {
		let newStartPoint = true

		for(const displayDie of collection.request.dice) {
			if(collection.token !== this.#activeRollToken) {
				return
			}

			const prepared = await this.#prepareDie(displayDie)
			const roll = {
				sides: displayDie.sides,
				data: displayDie.sides === 100 ? undefined : displayDie.data,
				dieType: `d${displayDie.sides}`,
				groupId: collection.id,
				collectionId: collection.id,
				rollId: this.#rollIndex++,
				id: this.#idIndex++,
				displayId: displayDie.id,
				theme: prepared.theme,
				themeColor: displayDie.themeColor,
				meshName: prepared.meshName,
				forcedValue: displayDie.value,
				forcedFaceValue: displayDie.faceValue,
				forcedDiscarded: displayDie.discarded,
				forcedResultMode: displayDie.forcedResultMode,
				newStartPoint,
				colorSuffix: prepared.colorSuffix
			}

			this.rollDiceData[roll.rollId] = roll
			collection.rolls.push(roll)

			if(!this.#webgl_support) {
				this.#DiceWorld.addNonDie({...roll, value: roll.forcedValue})
			} else {
				this.#DiceWorld.add(roll)
			}

			newStartPoint = false
		}
	}

	async #prepareDie(displayDie) {
		let theme = displayDie.theme
		let themeConfig = await this.loadTheme(theme)
		let meshName = themeConfig.meshName
		let diceAvailable = themeConfig?.diceAvailableSet || new Set(themeConfig?.diceAvailable || [])
		let diceExtended = themeConfig.diceExtended || {}
		let diceExtendedSet = themeConfig.diceExtendedSet || new Set(Object.keys(diceExtended))
		let materialType = themeConfig?.material?.type
		const dieType = `d${displayDie.sides}`

		if(!diceAvailable.has(dieType) && diceExtendedSet.has(dieType)) {
			theme = diceExtended[dieType]
			themeConfig = await this.loadTheme(theme)
			meshName = themeConfig.meshName
			diceAvailable = themeConfig?.diceAvailableSet || new Set(themeConfig?.diceAvailable || [])
			materialType = themeConfig?.material?.type
		}

		if(!diceAvailable.has(dieType) && !diceExtendedSet.has(dieType)) {
			throw new Error(`${dieType} is unavailable in '${displayDie.theme}' theme.`)
		}

		return {
			theme,
			meshName,
			colorSuffix: this.#getColorSuffix(theme, displayDie.themeColor, materialType)
		}
	}

	#handleDieComplete(result) {
		const die = this.rollDiceData[result.rollId]
		if(!die) {
			return
		}

		const collection = this.rollCollectionData[die.collectionId]
		if(!collection || collection.token !== this.#activeRollToken) {
			return
		}

		die.value = result.value
		collection.completedRolls++

		if(collection.completedRolls === collection.rolls.length) {
			const resultPayload = toDisplayRollResult(collection.request, collection.rolls)
			collection.resolve(resultPayload)
			delete this.rollCollectionData[collection.id]
		}
	}

	#handleRollError(error) {
		const normalizedError = error instanceof Error
			? error
			: new Error(error?.message || String(error))
		if(error?.stack && !normalizedError.stack) {
			normalizedError.stack = error.stack
		}
		Object.values(this.rollCollectionData).forEach(collection => {
			if(collection.token === this.#activeRollToken) {
				collection.reject(normalizedError)
				delete this.rollCollectionData[collection.id]
			}
		})
	}

	#resetRollState() {
		this.#collectionIndex = 0
		this.#rollIndex = 0
		this.#idIndex = 0
		this.rollCollectionData = {}
		this.rollDiceData = {}
	}

	#normalizeMaxDice(value) {
		const maxDice = Number(value)
		if(!Number.isInteger(maxDice) || maxDice < 1) {
			throw new Error('Config option "maxDice" must be a positive integer.')
		}
		return maxDice
	}

	#supportsOffscreenCanvas() {
		return this.#webgl_support
			&& typeof window !== 'undefined'
			&& 'OffscreenCanvas' in window
			&& typeof this.canvas?.transferControlToOffscreen === 'function'
	}

	async #loadThemes(themes) {
		const uniqueThemes = [...new Set(Array.from(themes || []).filter(Boolean))]
		if(!uniqueThemes.length) {
			return []
		}
		return Promise.all(uniqueThemes.map(theme => this.loadTheme(theme)))
	}

	#getColorSuffix(theme, themeColor, materialType) {
		if(materialType !== 'color') {
			return ''
		}

		const cacheKey = `${theme}|${themeColor}|${materialType}`
		if(this.#colorSuffixCache.has(cacheKey)) {
			return this.#colorSuffixCache.get(cacheKey)
		}

		const color = hexToRGB(themeColor)
		const colorSuffix = ((color.r * 0.299 + color.g * 0.587 + color.b * 0.114) > 175) ? '_dark' : '_light'
		this.#colorSuffixCache.set(cacheKey, colorSuffix)
		return colorSuffix
	}
}

class Collection {
	constructor(options) {
		Object.assign(this, options)
		this.rolls = options.rolls || []
		this.completedRolls = 0
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
	}
}

export default WorldFacade
