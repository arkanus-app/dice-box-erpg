import HavokPhysics from '@babylonjs/havok'

type HavokRuntime = Awaited<ReturnType<typeof HavokPhysics>>

/** Cache only the most recently requested URL, including its revision/query.
 * Plugins still own separate worlds and release those worlds on dispose().
 * Bounding the cache avoids retaining a WASM heap for every historical URL.
 */
export const createHavokRuntimeLoader = (
	create: (url: string) => Promise<HavokRuntime>
): ((url: string) => Promise<HavokRuntime>) => {
	let cached: { url: string; promise: Promise<HavokRuntime> } | undefined
	return url => {
		let resolvedUrl: string
		try {
			resolvedUrl = typeof document === 'undefined' ? url : new URL(url, document.baseURI).href
		} catch(error) {
			return Promise.reject(error)
		}
		if(cached?.url === resolvedUrl) return cached.promise
		const promise = Promise.resolve().then(() => create(resolvedUrl))
		cached = { url: resolvedUrl, promise }
		void promise.catch(() => {
			if(cached?.promise === promise) cached = undefined
		})
		return promise
	}
}

export const loadHavokRuntime = createHavokRuntimeLoader(
	url => HavokPhysics({ locateFile: () => url })
)
