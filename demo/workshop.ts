import { version } from '../package.json'
import {
	DiceResultViewer,
	createDiceLook,
	diceLookOptions,
	isDisplayCancelledError,
	type DiceGlowOptions,
	type DiceLook,
	type DiceSkinOptions
} from '../src'
import { createParticleEditor } from './particleEditor'
import { SKIN_SAMPLES, sampleSkin } from './skins'
import { WORKSHOP_PRESETS, type WorkshopPreset } from './looks'
import { rollTimeline, seedShowing } from './rolls'

/**
 * Workshop: builds a complete dice look (color, skin, particles per moment and
 * glow), tests it on real rolls and exports it as a JSON file that
 * `viewer.applyLook()` / `diceLookOptions()` read back.
 */

const $ = <T extends Element>(selector: string): T => {
	const element = document.querySelector<T>(selector)
	if(!element) throw new Error(`Missing ${selector}`)
	return element
}

const STATE_KEY = 'dice3dview-workshop-state'
const LOOKS_KEY = 'dice3dview-workshop-looks'
const CUSTOM = 'custom'

const nameInput = $<HTMLInputElement>('#look-name')
const presetSelect = $<HTMLSelectElement>('#look-preset')
const savedSelect = $<HTMLSelectElement>('#look-saved')
const colorInput = $<HTMLInputElement>('#color')
const skinSelect = $<HTMLSelectElement>('#skin')
const skinFile = $<HTMLInputElement>('#skin-file')
const skinScale = $<HTMLInputElement>('#skin-scale')
const skinBlend = $<HTMLSelectElement>('#skin-blend')
const skinOpacity = $<HTMLInputElement>('#skin-opacity')
const skinLabels = $<HTMLSelectElement>('#skin-labels')
const swatches = $<HTMLDivElement>('#skin-swatches')
const glowInput = $<HTMLInputElement>('#glow')
const glowOwn = $<HTMLInputElement>('#glow-own')
const glowColor = $<HTMLInputElement>('#glow-color')
const glowIntensity = $<HTMLInputElement>('#glow-intensity')
const glowLight = $<HTMLInputElement>('#glow-light')
const glowPulse = $<HTMLInputElement>('#glow-pulse')
const notationInput = $<HTMLInputElement>('#notation')
const status = $<HTMLParagraphElement>('#status')

$('#version').textContent = `v${version}`

/** Texture of the "custom" skin choice: an uploaded image or the one inside an imported look. */
let customTexture: string | null = null
let lastRoll = { notation: '3d6', seed: 'oficina' }

const say = (message: string): void => {
	status.textContent = message
}

const storage = {
	read<T>(key: string): T | null {
		try {
			const raw = localStorage.getItem(key)
			return raw ? JSON.parse(raw) as T : null
		} catch {
			return null
		}
	},
	write(key: string, value: unknown): boolean {
		try {
			localStorage.setItem(key, JSON.stringify(value))
			return true
		} catch {
			return false
		}
	}
}

// ---------- viewer ----------

const viewer = new DiceResultViewer({
	container: '#stage',
	assetPath: '/assets/dice-box/',
	theme: 'default',
	themeColor: colorInput.value,
	scale: 4.6
})
await viewer.init()

const roll = async (notation: string, options: { readonly shows?: string; readonly repeat?: boolean } = {}): Promise<void> => {
	const trimmed = notation.trim()
	if(!trimmed) return
	const seed = options.repeat ? lastRoll.seed : seedShowing(trimmed, options.shows, `oficina-${Date.now().toString(36)}`)
	lastRoll = { notation: trimmed, seed }
	try {
		const output = await rollTimeline(viewer, trimmed, seed)
		say(output)
	} catch(error) {
		if(isDisplayCancelledError(error)) return
		say(error instanceof Error ? error.message : String(error))
	}
}

// ---------- skin ----------

skinSelect.append(
	new Option('nenhuma (só a cor)', ''),
	...SKIN_SAMPLES.map(([id, label]) => new Option(label, id)),
	new Option('imagem do PC / do arquivo', CUSTOM)
)

const currentSkin = (): DiceSkinOptions | null => {
	const texture = skinSelect.value === CUSTOM ? customTexture : skinSelect.value ? sampleSkin(skinSelect.value) : null
	if(!texture) return null
	return {
		texture,
		scale: Number(skinScale.value),
		blend: skinBlend.value as NonNullable<DiceSkinOptions['blend']>,
		opacity: Number(skinOpacity.value),
		labels: skinLabels.value as NonNullable<DiceSkinOptions['labels']>
	}
}

/** Thumbnails of the sample skins, painted a few at a time so the page stays responsive. */
const paintSwatches = (): void => {
	const queue = [...SKIN_SAMPLES]
	const next = (): void => {
		const item = queue.shift()
		if(!item) return
		const [id, label] = item
		const button = document.createElement('button')
		button.type = 'button'
		button.className = 'swatch'
		button.title = label
		button.style.backgroundImage = `url(${sampleSkin(id) ?? ''})`
		button.addEventListener('click', () => {
			skinSelect.value = id
			void applySkin()
		})
		swatches.append(button)
		setTimeout(next, 0)
	}
	next()
}

// ---------- glow ----------

const currentGlow = (): DiceGlowOptions | null => glowInput.checked
	? {
		intensity: Number(glowIntensity.value),
		light: glowLight.checked,
		pulse: glowPulse.checked,
		...(glowOwn.checked ? {} : { color: glowColor.value })
	}
	: null

const syncGlowControls = (): void => {
	for(const control of [glowOwn, glowIntensity, glowLight, glowPulse]) control.disabled = !glowInput.checked
	glowColor.disabled = !glowInput.checked || glowOwn.checked
}

const showGlow = (glow: DiceGlowOptions | null | undefined): void => {
	glowInput.checked = Boolean(glow)
	glowOwn.checked = !glow?.color
	if(glow?.color) glowColor.value = glow.color.slice(0, 7)
	glowIntensity.value = String(glow?.intensity ?? 1)
	glowLight.checked = glow?.light !== false
	glowPulse.checked = Boolean(glow?.pulse)
	syncGlowControls()
}

// ---------- particles ----------

const editor = createParticleEditor($('#particle-editor'), {
	onChange: particles => {
		viewer.updateOptions({ particles }).catch(error => say(`Efeito inválido: ${error instanceof Error ? error.message : String(error)}`))
		saveState()
	},
	onTest: moment => viewer.playParticles(moment),
	onReroll: () => void roll(lastRoll.notation, { repeat: true })
}, { storageKey: 'dice3dview-workshop-particles' })

// ---------- state ----------

interface WorkshopState {
	readonly name: string
	readonly color: string
	readonly skin: string
	readonly customTexture: string | null
	readonly scale: string
	readonly blend: string
	readonly opacity: string
	readonly labels: string
	readonly glow: DiceGlowOptions | null
}

const saveState = (): void => {
	const state: WorkshopState = {
		name: nameInput.value,
		color: colorInput.value,
		skin: skinSelect.value,
		customTexture,
		scale: skinScale.value,
		blend: skinBlend.value,
		opacity: skinOpacity.value,
		labels: skinLabels.value,
		glow: currentGlow()
	}
	// A large uploaded image may not fit in storage: keep the rest.
	if(!storage.write(STATE_KEY, state)) storage.write(STATE_KEY, { ...state, customTexture: null })
}

const applySkin = async (): Promise<void> => {
	saveState()
	await viewer.updateOptions({ skin: currentSkin(), themeColor: colorInput.value })
	void roll(lastRoll.notation, { repeat: true })
}

const applyGlow = (): void => {
	syncGlowControls()
	saveState()
	void viewer.updateOptions({ glow: currentGlow() })
}

// ---------- looks ----------

/** Re-encodes a texture for the look file: at most 512 px, WebP when the browser can write it. */
const compactTexture = async (url: string): Promise<string> => {
	const image = new Image()
	image.src = url
	await image.decode()
	const side = Math.min(512, Math.max(image.naturalWidth, image.naturalHeight))
	const scale = side / Math.max(image.naturalWidth, image.naturalHeight)
	const canvas = document.createElement('canvas')
	canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
	canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
	canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height)
	const webp = canvas.toDataURL('image/webp', 0.9)
	return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png')
}

const buildLook = async (): Promise<DiceLook> => {
	const skin = currentSkin()
	return createDiceLook({
		name: nameInput.value.trim() || 'Visual',
		themeColor: colorInput.value,
		skin: skin ? { ...skin, texture: await compactTexture(skin.texture) } : null,
		particles: editor.options(),
		glow: currentGlow()
	})
}

/** Shows a look in every control and on the dice. */
const showLook = (look: DiceLook): void => {
	nameInput.value = look.name ?? 'Visual'
	if(look.themeColor) colorInput.value = look.themeColor
	if(look.skin) {
		customTexture = look.skin.texture
		skinSelect.value = CUSTOM
		skinScale.value = String(look.skin.scale ?? 1)
		skinBlend.value = look.skin.blend ?? 'normal'
		skinOpacity.value = String(look.skin.opacity ?? 1)
		skinLabels.value = look.skin.labels ?? 'auto'
	} else skinSelect.value = ''
	showGlow(look.glow)
	editor.load(look.particles ?? null)
	void viewer.applyLook(look).then(() => roll(lastRoll.notation, { repeat: true }))
	saveState()
}

/** A ready-made look: sample skin by reference (compacted only on export) and a preset. */
const showPreset = (preset: WorkshopPreset): void => {
	nameInput.value = preset.name
	colorInput.value = preset.themeColor
	skinSelect.value = preset.skin?.sample ?? ''
	skinScale.value = String(preset.skin?.scale ?? 1)
	skinBlend.value = preset.skin?.blend ?? 'normal'
	skinOpacity.value = String(preset.skin?.opacity ?? 1)
	skinLabels.value = preset.skin?.labels ?? 'auto'
	showGlow(preset.glow)
	editor.load({ preset: preset.particles })
	saveState()
	void viewer.updateOptions({ themeColor: colorInput.value, skin: currentSkin(), glow: currentGlow() })
		.then(() => roll(lastRoll.notation, { repeat: true }))
}

presetSelect.append(new Option('— escolha um visual pronto —', ''), ...WORKSHOP_PRESETS.map(preset => new Option(preset.name, preset.id)))
presetSelect.addEventListener('change', () => {
	const preset = WORKSHOP_PRESETS.find(item => item.id === presetSelect.value)
	if(preset) showPreset(preset)
	presetSelect.value = ''
})

const savedLooks = (): DiceLook[] => storage.read<DiceLook[]>(LOOKS_KEY) ?? []
const renderSaved = (selected = ''): void => {
	const looks = savedLooks()
	savedSelect.replaceChildren(new Option(looks.length ? '— abrir um visual salvo —' : '(nenhum salvo)', ''), ...looks.map((look, index) => new Option(look.name ?? `Visual ${index + 1}`, String(index))))
	savedSelect.value = selected
}
savedSelect.addEventListener('change', () => {
	const look = savedLooks()[Number(savedSelect.value)]
	if(look && savedSelect.value !== '') showLook(look)
})
$('#look-save').addEventListener('click', () => {
	void buildLook().then(look => {
		const looks = savedLooks().filter(item => item.name !== look.name)
		looks.push(look)
		if(storage.write(LOOKS_KEY, looks)) {
			renderSaved(String(looks.length - 1))
			say(`"${look.name}" salvo neste navegador.`)
		} else say('Sem espaço no navegador para salvar (imagens grandes ocupam muito); exporte o JSON.')
	})
})
$('#look-delete').addEventListener('click', () => {
	const index = Number(savedSelect.value)
	if(savedSelect.value === '') return
	const looks = savedLooks()
	const [removed] = looks.splice(index, 1)
	storage.write(LOOKS_KEY, looks)
	renderSaved()
	say(`"${removed?.name ?? 'Visual'}" excluído.`)
})

const slug = (name: string): string => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'visual'

$('#look-export').addEventListener('click', () => {
	void buildLook().then(look => {
		const blob = new Blob([JSON.stringify(look, null, 2)], { type: 'application/json' })
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `${slug(look.name ?? 'visual')}.dice-look.json`
		link.click()
		setTimeout(() => URL.revokeObjectURL(link.href), 1000)
		say(`Exportado: ${link.download} (${Math.round(blob.size / 1024)} KB).`)
	}).catch(error => say(`Não foi possível exportar: ${error instanceof Error ? error.message : String(error)}`))
})

const lookFile = $<HTMLInputElement>('#look-file')
$('#look-import').addEventListener('click', () => lookFile.click())
lookFile.addEventListener('change', () => {
	const file = lookFile.files?.[0]
	lookFile.value = ''
	if(!file) return
	void file.text().then(text => {
		const look = JSON.parse(text) as DiceLook
		diceLookOptions(look)
		showLook(look)
		say(`Importado: ${look.name ?? file.name}.`)
	}).catch(error => say(`Arquivo inválido: ${error instanceof Error ? error.message : String(error)}`))
})

// ---------- controls ----------

$('#skin-upload').addEventListener('click', () => skinFile.click())
skinFile.addEventListener('change', () => {
	const file = skinFile.files?.[0]
	skinFile.value = ''
	if(!file) return
	const reader = new FileReader()
	reader.onload = () => {
		// Kept as a data URL so the look can be saved and exported with it.
		void compactTexture(String(reader.result)).then(texture => {
			customTexture = texture
			skinSelect.value = CUSTOM
			void applySkin()
		})
	}
	reader.readAsDataURL(file)
})
skinSelect.addEventListener('change', () => {
	if(skinSelect.value === CUSTOM && !customTexture) skinFile.click()
	else void applySkin()
})
for(const control of [skinScale, skinBlend, skinOpacity, skinLabels, colorInput]) control.addEventListener('change', () => void applySkin())
for(const control of [glowInput, glowOwn, glowColor, glowIntensity, glowLight, glowPulse]) control.addEventListener('input', applyGlow)
nameInput.addEventListener('change', saveState)

const TESTS: readonly { readonly label: string; readonly notation: string; readonly shows?: string }[] = [
	{ label: 'd20', notation: 'd20' },
	{ label: '3d6', notation: '3d6' },
	{ label: 'kit d4–d20', notation: 'd4+d6+d8+d10+d12+d20' },
	{ label: '3 moedas', notation: '3d2' },
	{ label: 'dados + moedas', notation: '2d6+2d2' },
	{ label: 'explosões', notation: '3d6!', shows: 'explode:explode' },
	{ label: 'crítico', notation: '1d20cs>19', shows: 'classify:critical-success' },
	{ label: 'keep 3 de 4', notation: '4d6kh3' },
	{ label: '12d6', notation: '12d6' }
]
const tests = $<HTMLDivElement>('#test-rolls')
for(const test of TESTS) {
	const button = document.createElement('button')
	button.type = 'button'
	button.textContent = test.label
	button.title = test.notation
	button.addEventListener('click', () => {
		notationInput.value = test.notation
		void roll(test.notation, test.shows ? { shows: test.shows } : {})
	})
	tests.append(button)
}
$<HTMLFormElement>('#notation-form').addEventListener('submit', event => {
	event.preventDefault()
	void roll(notationInput.value)
})

// ---------- start ----------

const restored = storage.read<WorkshopState>(STATE_KEY)
if(restored) {
	nameInput.value = restored.name
	colorInput.value = restored.color
	customTexture = restored.customTexture
	skinSelect.value = restored.skin === CUSTOM && !customTexture ? '' : restored.skin
	skinScale.value = restored.scale
	skinBlend.value = restored.blend
	skinOpacity.value = restored.opacity
	skinLabels.value = restored.labels
	showGlow(restored.glow)
	await viewer.updateOptions({ themeColor: colorInput.value, skin: currentSkin(), glow: currentGlow(), particles: editor.options() })
	void roll('3d6')
} else {
	syncGlowControls()
	showPreset(WORKSHOP_PRESETS.find(preset => preset.id === 'lava')!)
}
renderSaved()
paintSwatches()
