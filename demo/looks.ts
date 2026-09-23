import type { DiceGlowOptions, DiceParticlePreset, DiceSkinBlend } from '../src'

/**
 * Ready-made looks of the workshop: each particle preset paired with a skin,
 * a color and a glow that suit it. They are starting points; the workshop
 * exports the edited result as a look file.
 */
export interface WorkshopPreset {
	readonly id: string
	readonly name: string
	readonly themeColor: string
	readonly skin: {
		readonly sample: string
		readonly blend?: DiceSkinBlend
		readonly scale?: number
		readonly opacity?: number
		readonly labels?: 'auto' | 'light' | 'dark'
	} | null
	readonly particles: DiceParticlePreset
	readonly glow: DiceGlowOptions | null
}

export const WORKSHOP_PRESETS: readonly WorkshopPreset[] = [
	{ id: 'treasure', name: 'Tesouro dourado', themeColor: '#c9a227', skin: { sample: 'gold', blend: 'normal' }, particles: 'sparkle', glow: { color: '#ffd166', intensity: 0.7 } },
	{ id: 'ember', name: 'Brasa', themeColor: '#5a1408', skin: { sample: 'obsidian', blend: 'screen', opacity: 0.8 }, particles: 'fire', glow: { color: '#ff7a1a', intensity: 1 } },
	{ id: 'arcane', name: 'Tomo arcano', themeColor: '#5b3dff', skin: { sample: 'galaxy', blend: 'overlay' }, particles: 'arcane', glow: { color: '#9d7dff', intensity: 0.8, pulse: true } },
	{ id: 'frost', name: 'Coração de gelo', themeColor: '#6fb7ff', skin: { sample: 'ice', blend: 'normal' }, particles: 'frost', glow: { color: '#9fdcff', intensity: 0.6 } },
	{ id: 'ruins', name: 'Pedra antiga', themeColor: '#8a8174', skin: { sample: 'stone', blend: 'multiply' }, particles: 'dust', glow: null },
	{ id: 'party', name: 'Festa', themeColor: '#ff4d6d', skin: { sample: 'marble', blend: 'multiply' }, particles: 'confetti', glow: null },
	{ id: 'circuit', name: 'Sobrecarga', themeColor: '#1b3a5c', skin: { sample: 'circuit', blend: 'normal' }, particles: 'electric', glow: { color: '#5cc8ff', intensity: 1 } },
	{ id: 'smoke', name: 'Fumaça', themeColor: '#2b2d33', skin: { sample: 'carbon', blend: 'normal' }, particles: 'smoke', glow: null },
	{ id: 'lava', name: 'Coração de lava', themeColor: '#2a0f0a', skin: { sample: 'lava', blend: 'normal' }, particles: 'lava', glow: { color: '#ff5a1a', intensity: 1.2, pulse: true } },
	{ id: 'storm', name: 'Olho da tormenta', themeColor: '#2a3a5c', skin: { sample: 'ocean', blend: 'multiply' }, particles: 'storm', glow: { color: '#9a7dff', intensity: 0.8, pulse: true } },
	{ id: 'relic', name: 'Relíquia sagrada', themeColor: '#f4e3b0', skin: { sample: 'marble', blend: 'multiply' }, particles: 'holy', glow: { color: '#ffe9a0', intensity: 1 } },
	{ id: 'void', name: 'Vazio', themeColor: '#140a24', skin: { sample: 'obsidian', blend: 'normal' }, particles: 'shadow', glow: { color: '#6a2cff', intensity: 0.9, pulse: true } },
	{ id: 'venom', name: 'Veneno', themeColor: '#2f8f1b', skin: { sample: 'toxic', blend: 'normal' }, particles: 'poison', glow: { color: '#7dff4a', intensity: 0.9 } },
	{ id: 'forest', name: 'Floresta', themeColor: '#3f7d2c', skin: { sample: 'moss', blend: 'normal' }, particles: 'nature', glow: null },
	{ id: 'cosmos', name: 'Cosmos', themeColor: '#2a1a5c', skin: { sample: 'galaxy', blend: 'normal' }, particles: 'cosmic', glow: { color: '#c04cff', intensity: 0.8 } }
]
