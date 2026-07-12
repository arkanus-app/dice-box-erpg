import './components/world/canvas.css'

export const createDisplayCanvas = (container: string | HTMLElement | null, id: string): HTMLCanvasElement => {
	if(typeof document === 'undefined') {
		throw new Error('DiceResultViewer requires a browser document.')
	}
	const parent = typeof container === 'string'
		? document.querySelector<HTMLElement>(container)
		: container
	if(!parent) {
		throw new Error(`DiceResultViewer target '${typeof container === 'string' ? container : '<element>'}' was not found.`)
	}
	const existing = document.getElementById(id)
	if(existing instanceof HTMLCanvasElement) existing.remove()
	const canvas = document.createElement('canvas')
	canvas.id = id
	canvas.classList.add('dice-box-canvas')
	parent.append(canvas)
	return canvas
}
