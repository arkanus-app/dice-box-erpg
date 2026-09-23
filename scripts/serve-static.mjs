// Read-only static server for the browser benchmark: node scripts/serve-static.mjs [root] [port]
// Serves files as they are on disk (no dev-server transforms), so v2 and v3 load the same way.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.argv[2] ?? '.')
const port = Number(process.argv[3] ?? 5182)
const types = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.wasm': 'application/wasm'
}

http.createServer((request, response) => {
	if(request.method !== 'GET' && request.method !== 'HEAD') {
		response.writeHead(405).end()
		return
	}
	const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
	let file = path.join(root, path.normalize(pathname).replace(/^([/\\])+/, ''))
	if(fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html')
	if(!file.startsWith(root) || !fs.existsSync(file)) {
		response.writeHead(404).end()
		return
	}
	response.writeHead(200, { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
	fs.createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} at http://localhost:${port}/`))
