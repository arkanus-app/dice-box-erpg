import worldWorker from './offscreenCanvas.worker?worker'

class WorldOffScreen {
	initialized = false
	offscreenWorkerInit = false
	themeLoadedInit = false
	pendingThemePromises = {}
	#offscreenCanvas
	#OffscreenWorker
	// onInitComplete = () => {} // init callback
	onRollResult = () => {} // individual die callback
	onRollError = () => {}
	onRollComplete = () => {} // roll group callback

	constructor(options){
		this.onInitComplete = options.onInitComplete

		// transfer control offscreen
		this.#offscreenCanvas = options.canvas.transferControlToOffscreen()

		// initialize 3D World in which BabylonJS runs
		this.#OffscreenWorker = new worldWorker()
		// need to initialize the web worker and get confirmation that initialization is complete before other scripts can run
		// set a property on the worker to a promise that is resolve when the proper message is returned from the worker
		this.#OffscreenWorker.init = new Promise((resolve, reject) => {
			this.offscreenWorkerInit = resolve
		})

		this.initialized = this.#initScene(options)
	}

	// initialize the babylon scene
	async #initScene(config) {
		// initialize the offscreen worker
		this.#OffscreenWorker.postMessage({
			action: "init",
			canvas: this.#offscreenCanvas,
			width: config.canvas.clientWidth,
			height: config.canvas.clientHeight,
			options: config.options,
		}, [this.#offscreenCanvas])

		// handle messages from offscreen BabylonJS World
		this.#OffscreenWorker.onmessage = (e) => {
			switch( e.data.action ) {
				case "init-complete":
					this.offscreenWorkerInit() //fulfill promise so other things can run
					break;
				case "theme-loaded":
					if(e.data.id){
						this.pendingThemePromises[e.data.id]?.resolve(e.data.id)
						delete this.pendingThemePromises[e.data.id]
					}
					break;
				case "theme-load-error":
					if(e.data.id){
						const error = new Error(e.data.message || `Unable to load theme '${e.data.id}'`)
						error.stack = e.data.stack || error.stack
						this.pendingThemePromises[e.data.id]?.reject(error)
						delete this.pendingThemePromises[e.data.id]
					}
					break;
				case 'roll-result':
					this.onRollResult(e.data.die)
					break;
				case 'roll-error':
					this.onRollError(e.data.error)
					break;
				case 'roll-complete':
					this.onRollComplete()
					break;
				case 'die-removed':
					this.onDieRemoved(e.data.rollId)
					break;
			}
		}
		// await Promise.all([this.#OffscreenWorker.init])
		await this.#OffscreenWorker.init

		this.onInitComplete(true)

		return true
	}

	updateConfig(options){
		this.#OffscreenWorker.postMessage({action: "updateConfig", options});
	}

	resize(options){
		this.#OffscreenWorker.postMessage({action: "resize", options});
	}

	async loadTheme(options) {
		// prevent multiple requests of the same theme
		if(this.pendingThemePromises[options.theme]) {
			return this.pendingThemePromises[options.theme].promise
		}

		const pending = {}
		pending.promise = new Promise((resolve, reject) => {
			pending.resolve = resolve
			pending.reject = reject
			this.#OffscreenWorker.postMessage({action: "loadTheme", options})
		})
		this.pendingThemePromises[options.theme] = pending

		return pending.promise
	}

	clear(){
		this.#OffscreenWorker.postMessage({action: "clearDice"})
	}

	dispose(){
		this.clear()
		this.#OffscreenWorker.terminate()
	}

	add(options){
		this.#OffscreenWorker.postMessage({action: "addDie", options})
	}
	
	addNonDie(options){
		this.#OffscreenWorker.postMessage({action: "addNonDie", options})
	}

	remove(options){
		// remove the die from the render
		this.#OffscreenWorker.postMessage({action: "removeDie", options})
	}
}

export default WorldOffScreen
