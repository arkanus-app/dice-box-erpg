import { createServer } from 'node:http'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { brotliCompressSync } from 'node:zlib'

export const createDistributionServer = directory => {
  const mime = { '.js': 'text/javascript', '.wasm': 'application/wasm', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' }
  const files = new Map()
  const precompress = directory => {
    for(const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if(entry.isDirectory()) precompress(file)
      else files.set(file, brotliCompressSync(readFileSync(file)))
    }
  }
  // Compression belongs to build/setup time, never the measured request path.
  precompress(directory)
  return createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname
    if(pathname === '/') {
      response.setHeader('Content-Type', 'text/html')
      response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>#stage canvas{display:block;width:100%;height:100%;position:absolute;inset:0}</style></head><body style="margin:0"><div id="stage" style="width:100vw;height:100vh;position:relative"></div></body></html>')
      return
    }
    const file = path.resolve(directory, `.${decodeURIComponent(pathname)}`)
    const body = files.get(file)
    if(!file.startsWith(`${directory}${path.sep}`) || !body) {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, {
      'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream',
      'Content-Encoding': 'br',
      'Content-Length': body.length,
      'Cache-Control': 'public, max-age=31536000, immutable'
    })
    response.end(body)
  })
}
