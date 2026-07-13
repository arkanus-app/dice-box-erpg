export interface PhysicsExplosionScheduleItem {
	readonly phaseIndex: number
	readonly actionIndex: number
	readonly parentDieId: string
	readonly dieId: string
}

export interface PhysicsExplosionSettlement {
	readonly completed: PhysicsExplosionScheduleItem | null
	readonly spawned: readonly PhysicsExplosionScheduleItem[]
}

export interface PhysicsExplosionScheduler {
	settle(dieId: string): PhysicsExplosionSettlement
}

/**
 * Tracks the causal explosion graph independently from render batches. Settling
 * one parent releases only its own children, even when siblings belong to the
 * same semantic depth.
 */
export const createPhysicsExplosionScheduler = (
	items: readonly PhysicsExplosionScheduleItem[]
): PhysicsExplosionScheduler => {
	const byParent = new Map<string, PhysicsExplosionScheduleItem[]>()
	const byChild = new Map<string, PhysicsExplosionScheduleItem>()
	for(const item of items) {
		const siblings = byParent.get(item.parentDieId) ?? []
		siblings.push(item)
		byParent.set(item.parentDieId, siblings)
		byChild.set(item.dieId, item)
	}
	const settled = new Set<string>()
	const spawned = new Set<string>()
	return Object.freeze({
		settle: (dieId: string): PhysicsExplosionSettlement => {
			if(settled.has(dieId)) return { completed: null, spawned: [] }
			settled.add(dieId)
			const next = (byParent.get(dieId) ?? []).filter(item => {
				if(spawned.has(item.dieId)) return false
				spawned.add(item.dieId)
				return true
			})
			return {
				completed: byChild.get(dieId) ?? null,
				spawned: Object.freeze(next)
			}
		}
	})
}
