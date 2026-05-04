import { Engine } from '@babylonjs/core/Engines/engine'

function createEngine(canvas, options = {}) {
  const engine = new Engine(canvas, options.antialias !== false, {
    preserveDrawingBuffer: false,
    stencil: false,
  })

  return engine
}

export { createEngine }