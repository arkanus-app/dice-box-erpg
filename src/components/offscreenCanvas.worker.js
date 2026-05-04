import WorldOnscreen from './world.onscreen'

let WorldOffscreen

// these are messages sent to this worker from World.js
self.onmessage = async (e) => {
  switch( e.data.action ) {
    case "addDie":
			WorldOffscreen.add(e.data.options)
      break
    case "addNonDie":
			WorldOffscreen.addNonDie(e.data.options)
      break
		case "loadTheme":
			try {
				await WorldOffscreen.loadTheme(e.data.options)
			} catch(error) {
				self.postMessage({
					action: "theme-load-error",
					id: e.data.options.theme,
					message: error?.message || String(error),
					stack: error?.stack
				})
			}
			break
    case "clearDice":
			WorldOffscreen.clear()
      break
		case "removeDie":
			WorldOffscreen.remove(e.data.options)
			break;
    case "resize":
			WorldOffscreen.resize(e.data.options)
      break
    case "init":
      // WorldOffscreen.initScene(e.data)
			WorldOffscreen = new WorldOnscreen({
				...e.data,
				onInitComplete: () => {
					self.postMessage({action:"init-complete"})
				},
				onThemeLoaded: ({id}) => {
					self.postMessage({action:"theme-loaded",id})
				},
				onRollResult: ({rollId, value}) => {
					self.postMessage({action:"roll-result", die: {
						rollId,
						value
					}})
				},
				onRollError: (error) => {
					self.postMessage({
						action: "roll-error",
						error: {
							message: error?.message || String(error),
							stack: error?.stack
						}
					})
				},
				onRollComplete: () => {
					self.postMessage({action: "roll-complete"})
				},
				onDieRemoved: (rollId) => {
					self.postMessage({action:"die-removed", rollId})
				}
			})
      break
		case "updateConfig":
			WorldOffscreen.updateConfig(e.data.options)
			break
    default:
      console.error("action not found in offscreen worker")
  }
}
