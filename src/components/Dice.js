import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { Matrix, Quaternion, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Ray } from "@babylonjs/core/Culling/ray";
// import { RayHelper } from '@babylonjs/core/Debug';
import '../helpers/babylonFileLoader'
import '@babylonjs/core/Meshes/instancedMesh'

import { deepCopy } from '../helpers';


const defaultOptions = {
  assetPath: '',
  enableShadows: false,
  groupId: null,
  id: null,
	lights: [],
  rollId: null,
  scene: null,
}

// TODO: this would probably be better as a factory pattern
class Dice {
  // mesh = null
  value = 0
  asleep = false
  constructor(options, scene) {
    this.config = {...defaultOptions, ...options}
    this.id = this.config.id !== undefined ? this.config.id : Date.now()
    this.sides = this.config.sides
		this.dieType = this.config.dieType
    this.comboKey = `${this.config.theme}_${this.config.dieType}`
    this.scene = scene
    this.createInstance()
  }

  createInstance() {
    // piece together the name of the die we want to instance
    const targetDieName = `${this.config.meshName}_${this.dieType}_${this.config.theme}${this.config.colorSuffix}`
    // create a new unique name for this instance
    const instanceName = `${targetDieName}-instance-${this.id}`

    // create the instance
    const targetDie = this.scene.getMeshByName(targetDieName)
    const dieInstance = targetDie.createInstance(instanceName)

    if(this.config.colorSuffix.length > 0){
      const color = Color3.FromHexString(this.config.themeColor)
      dieInstance.instancedBuffers.customColor = color
    }

    dieInstance.metadata = targetDie.metadata

		// start the instance under the floor, out of camera view
		dieInstance.position.y = -100
    dieInstance.scaling = new Vector3(
      dieInstance.scaling.x * this.config.scale,
      dieInstance.scaling.y * this.config.scale,
      dieInstance.scaling.z * this.config.scale
    )
		
    if(this.config.enableShadows){
      // let's keep this simple for now since we know there's only one directional light
      this.config.lights["directional"].shadowGenerator.addShadowCaster(dieInstance)
      // for (const key in this.config.lights) {
      //   if(key !== 'hemispheric' ) {
      //     this.config.lights[key].shadowGenerator.addShadowCaster(dieInstance)
      //   }
      // }
    }

    // attach the instance to the class object
    this.mesh = dieInstance
  }



  // TODO: add themeOptions for colored materials, must ensure theme and themeOptions are unique somehow
  static async loadDie(options, scene) {
    const { sides, theme = 'default', meshName, colorSuffix} = options

    if(!options.dieType){
      options.dieType = Number.isInteger(sides) ? `d${sides}` : sides
    }

    // create a key for this die type and theme for caching and instance creation
    const dieMeshName = meshName + '_' + options.dieType
    const dieMaterialName = dieMeshName + '_' + theme + colorSuffix
    let die = scene.getMeshByName(dieMaterialName)

    if (!die) {
      die = scene.getMeshByName(dieMeshName).clone(dieMaterialName)
    }

    if(!die.material) {
      die.material = scene.getMaterialByName(theme + colorSuffix)
      if(colorSuffix.length > 0){
        die.registerInstancedBuffer("customColor", 3)
      }

      // die.material.freeze()
    }

    return options
  }

  // load all the dice models
  static async loadModels(options, scene) {
    // can we get scene without passing it in?
    const {meshFilePath, meshName, scale, d4FaceDown = true} = options
    let has_d100 = false
    let has_d10 = false

    //TODO: cache model files so it won't have to be fetched by other themes using the same models
    // using fetch to get modelData so we can pull out data unrelated to mesh importing
    const modelData = await fetch(`${meshFilePath}`).then(resp => {
      if(resp.ok) {
        const contentType = resp.headers.get("content-type")
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return resp.json()
        } 
        else if (resp.type && resp.type === 'basic') {
          return resp.json()
        }
        else {
          // return resp
          throw new Error(`Incorrect contentType: ${contentType}. Expected "application/json" or "basic"`)
        }
      } else {
        throw new Error(`Unable to load 3D mesh file: '${meshFilePath}'. Request rejected with status ${resp.status}: ${resp.statusText}`)
      }
    })

    if(!modelData){
      return
    }

    const data = await SceneLoader.ImportMeshAsync(null,null, 'data:' + JSON.stringify(modelData) , scene)
    data.meshes.forEach(model => {
      if(model.name === "__root__") {
        model.dispose()
      }
      // shrink the colliders
      if( model.name.includes("collider")) {
        model.scaling = new Vector3(
          model.scaling.x * .9,
          model.scaling.y * .9,
          model.scaling.z * .9
        )
      }
      // check if d100 is available as a mesh - otherwise we'll clone a d10
      if (!has_d100) {
        has_d100 = model.name === "d100"
      }
      if (!has_d10) {
        has_d10 = model.name === "d10"
      }
      model.setEnabled(false)
      model.freezeNormals()
      model.freezeWorldMatrix()
      model.isPickable = false
      model.doNotSyncBoundingInfo = true
      // model.scaling = new Vector3(model.scaling)
      // prefix all the meshes ids from this file with the file name so we can find them later e.g.: 'default-dice_d10' and 'default-dice_d10_collider'
      // model.id = meshName + '_' + model.id
      model.name = meshName + '_' + model.name
      model.metadata = {
        baseScale: model.scaling
      }
    })
    if(!has_d100 && has_d10) {
      // console.log("create a d100 from a d10")  
      scene.getMeshByName(meshName + '_d10').clone(meshName + '_d100')
      scene.getMeshByName(meshName + '_d10_collider').clone(meshName + '_d100_collider')
      if(modelData.colliderFaceMap) {
        modelData.colliderFaceMap['d100'] = deepCopy(modelData.colliderFaceMap['d10'])
        Object.values(modelData.colliderFaceMap['d100']).forEach((val,i) => {
          modelData.colliderFaceMap['d100'][i] = val * (val === 10 ? 0 : 10)
        })
      }
    }
    // save colliderFaceMap to scene - couldn't find a better place to stash this
    if(!modelData.colliderFaceMap){
      throw new Error(`'colliderFaceMap' data not found in ${meshFilePath}. Without the colliderFaceMap data dice values can not be resolved.`)
    }
    scene.themeData[meshName] = {}
    scene.themeData[meshName].colliderFaceMap = modelData.colliderFaceMap
    scene.themeData[meshName].d4FaceDown = d4FaceDown
    // return collider data so it can be passed to physics
    // TODO: return any physics settings as well
    return modelData.meshes.filter(model => model.name.includes("collider"))
  }

  updateConfig(option) {
    this.config = {...this.config, ...option}
  }

  static ray = new Ray(Vector3.Zero(), Vector3.Zero(), 1)
  static vector3 = Vector3.Zero()

  static setVector3(x,y,z) {
    return Dice.vector3.set(x,y,z)
  }
  
  static getVector3() {
    return Dice.vector3
  }

  static getForcedFaceValue(die) {
    return die.config?.forcedFaceValue ?? die.config?.forcedValue
  }

  static getForcedValue(die) {
    return die.config?.forcedValue ?? Dice.getForcedFaceValue(die)
  }

  static getFaceNormal(collider, faceId) {
    const positions = collider.getVerticesData('position')
    const normals = collider.getVerticesData('normal')
    const indices = collider.getIndices()
    const triangleStart = Number(faceId) * 3

    const getVertexIndex = (offset) => indices ? indices[triangleStart + offset] : triangleStart + offset
    const getPoint = (offset) => {
      const vertexIndex = getVertexIndex(offset)
      return new Vector3(
        positions[vertexIndex * 3],
        positions[vertexIndex * 3 + 1],
        positions[vertexIndex * 3 + 2]
      )
    }
    const orientOutward = (normal, center) => {
      if(center && Vector3.Dot(normal, center) < 0) {
        normal.scaleInPlace(-1)
      }
      return normal
    }

    if(positions) {
      const p0 = getPoint(0)
      const p1 = getPoint(1)
      const p2 = getPoint(2)
      const faceNormal = Vector3.Cross(p1.subtract(p0), p2.subtract(p0))

      if(faceNormal.lengthSquared() > 1e-10) {
        const center = new Vector3(
          (p0.x + p1.x + p2.x) / 3,
          (p0.y + p1.y + p2.y) / 3,
          (p0.z + p1.z + p2.z) / 3
        )
        return orientOutward(faceNormal, center).normalize()
      }
    }

    if(!normals) {
      return null
    }

    const faceNormal = new Vector3(0, 0, 0)
    const center = positions ? new Vector3(0, 0, 0) : null

    for(let i = 0; i < 3; i++) {
      const vertexIndex = getVertexIndex(i)
      faceNormal.addInPlaceFromFloats(
        normals[vertexIndex * 3],
        normals[vertexIndex * 3 + 1],
        normals[vertexIndex * 3 + 2]
      )

      if(center) {
        center.addInPlaceFromFloats(
          positions[vertexIndex * 3],
          positions[vertexIndex * 3 + 1],
          positions[vertexIndex * 3 + 2]
        )
      }
    }

    if(faceNormal.lengthSquared() <= 1e-10) {
      return null
    }

    if(center) {
      center.scaleInPlace(1 / 3)
    }

    return orientOutward(faceNormal, center).normalize()
  }

  static getMappedFaceNormal(collider, faceMap, value) {
    const normal = new Vector3(0, 0, 0)
    let matches = 0

    for(const [faceId, faceValue] of Object.entries(faceMap)) {
      if(Number(faceValue) !== Number(value)) {
        continue
      }
      const faceNormal = Dice.getFaceNormal(collider, faceId)
      if(faceNormal) {
        normal.addInPlace(faceNormal)
        matches++
      }
    }

    return matches > 0 ? normal.normalize() : null
  }

  static getMatchingFaceNormals(collider, faceMap, value) {
    const matches = []

    for(const [faceId, faceValue] of Object.entries(faceMap)) {
      if(Number(faceValue) !== Number(value)) {
        continue
      }

      const normal = Dice.getFaceNormal(collider, faceId)
      if(normal) {
        matches.push({ faceId: Number(faceId), normal })
      }
    }

    return matches
  }

  static transformNormalByQuaternion(normal, quaternion) {
    const matrix = Matrix.Identity()
    Matrix.FromQuaternionToRef(quaternion, matrix)
    return Vector3.TransformNormal(normal, matrix).normalize()
  }

  static chooseShortestQuaternion(source, target) {
    if(Quaternion.Dot(source, target) < 0) {
      return target.scale(-1)
    }
    return target
  }

  static buildForcedTargetQuaternion(sourceQuaternion, targetFaceNormal, topVector) {
    const currentTargetNormal = targetFaceNormal.applyRotationQuaternion
      ? targetFaceNormal.applyRotationQuaternion(sourceQuaternion).normalize()
      : Dice.transformNormalByQuaternion(targetFaceNormal, sourceQuaternion)
    const delta = Quaternion.FromUnitVectorsToRef(currentTargetNormal, topVector, Quaternion.Identity())
    const targetQuaternion = delta.multiply(sourceQuaternion).normalize()
    return Dice.chooseShortestQuaternion(sourceQuaternion, targetQuaternion)
  }

  static pickTopFaceValue(die, scene, collider, faceMap, quaternion, topVector) {
    const hitbox = collider.createInstance(`${collider.name}-sync-candidate-${die.id}-${Date.now()}`)
    hitbox.isPickable = true
    hitbox.isVisible = true
    hitbox.setEnabled(true)
    hitbox.position.copyFrom(die.mesh.position)
    hitbox.rotationQuaternion = quaternion.clone()
    hitbox.computeWorldMatrix(true)

    try {
      Dice.ray.direction = topVector
      Dice.ray.origin = die.mesh.position

      const picked = scene.pickWithRay(Dice.ray, (mesh) => mesh === hitbox)
      const faceId = picked?.faceId
      return {
        faceId,
        value: faceId !== undefined ? faceMap[faceId] : undefined
      }
    } finally {
      hitbox.dispose()
    }
  }

  static resolveForcedTargetQuaternion(die, scene, collider, faceMap, forcedFaceValue, sourceQuaternion, topVector) {
    const candidates = Dice.getMatchingFaceNormals(collider, faceMap, forcedFaceValue)
    let bestCandidate = null

    for(const candidate of candidates) {
      const quaternion = Dice.buildForcedTargetQuaternion(sourceQuaternion, candidate.normal, topVector)
      const picked = Dice.pickTopFaceValue(die, scene, collider, faceMap, quaternion, topVector)

      if(Number(picked.value) !== Number(forcedFaceValue)) {
        continue
      }

      const resolvedNormal = Dice.transformNormalByQuaternion(candidate.normal, quaternion)
      const score = Vector3.Dot(resolvedNormal, topVector)
      if(!bestCandidate || score > bestCandidate.score) {
        bestCandidate = { quaternion, score }
      }
    }

    if(bestCandidate) {
      return bestCandidate.quaternion
    }

    const targetFaceNormal = Dice.getMappedFaceNormal(collider, faceMap, forcedFaceValue)
    return targetFaceNormal
      ? Dice.buildForcedTargetQuaternion(sourceQuaternion, targetFaceNormal, topVector)
      : null
  }

  static smoothForcedResult(die, scene, amount = 1, animate = false, animateFromCurrent = false) {
    const forcedFaceValue = Dice.getForcedFaceValue(die)
    if(forcedFaceValue === undefined || !die.mesh?.rotationQuaternion) {
      return false
    }

    const meshName = die.config.parentMesh || die.config.meshName
    const themeData = scene.themeData[meshName]
    const faceMap = themeData?.colliderFaceMap?.[die.dieType]
    const collider = scene.getMeshByName(`${meshName}_${die.dieType}_collider`)
    if(!faceMap || !collider) {
      return false
    }

    const topVector = die.dieType === 'd4' && themeData?.d4FaceDown
      ? new Vector3(0, -1, 0)
      : new Vector3(0, 1, 0)
    const sourceQuaternion = (die.__rawRotationQuaternion || die.mesh.rotationQuaternion).clone().normalize()
    const targetQuaternion = Dice.resolveForcedTargetQuaternion(
      die,
      scene,
      collider,
      faceMap,
      forcedFaceValue,
      sourceQuaternion,
      topVector
    )

    if(!targetQuaternion) {
      return false
    }
    const clampedAmount = Math.max(0, Math.min(1, amount))
    const amountTargetQuaternion = Quaternion.Slerp(sourceQuaternion, targetQuaternion, clampedAmount).normalize()
    const animationSourceQuaternion = animateFromCurrent
      ? die.mesh.rotationQuaternion.clone().normalize()
      : sourceQuaternion

    const apply = (progress) => {
      const clamped = Math.max(0, Math.min(1, progress))
      const nextQuaternion = Quaternion.Slerp(animationSourceQuaternion, amountTargetQuaternion, clamped).normalize()
      if(die.mesh.rotationQuaternion?.copyFrom) {
        die.mesh.rotationQuaternion.copyFrom(nextQuaternion)
      } else {
        die.mesh.rotationQuaternion = nextQuaternion
      }
      die.mesh.computeWorldMatrix?.(true)
      scene.render?.()
    }

    if(!animate) {
      apply(amount)
      return true
    }

    const start = performance.now()
    const duration = 180
    const tick = (time) => {
      const progress = Math.min(1, (time - start) / duration)
      apply(progress)
      if(progress < 1) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
    return true
  }

  static fadeDiscarded(die) {
    if(!die.mesh?.instancedBuffers?.customColor || die.__discardFadeStarted) {
      return
    }

    die.__discardFadeStarted = true
    const startColor = die.mesh.instancedBuffers.customColor.clone()
    const endColor = Color3.FromHexString('#676a72')
    const start = performance.now()
    const duration = 320
    const tick = (time) => {
      const progress = Math.min(1, (time - start) / duration)
      die.mesh.instancedBuffers.customColor = Color3.Lerp(startColor, endColor, progress)
      if(progress < 1) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  }

  static async getRollResult(die,scene) {
    // TODO: Why a function in a function?? fix this
    const getDieRoll = (d=die) => new Promise((resolve,reject) => {

      const meshName = die.config.parentMesh || die.config.meshName
      const meshFaceIds = scene.themeData[meshName].colliderFaceMap
      const d4FaceDown = scene.themeData[meshName].d4FaceDown

      if(!meshFaceIds[d.dieType]){
        throw new Error(`No colliderFaceMap data for ${d.dieType}`)
      }

      // const dieHitbox = d.config.scene.getMeshByName(`${d.dieType}_collider`).createInstance(`${d.dieType}-hitbox-${d.id}`)
      const dieHitbox = scene.getMeshByName(`${meshName}_${d.dieType}_collider`).createInstance(`${meshName}_${d.dieType}-hitbox-${d.id}`)
      dieHitbox.isPickable = true
      dieHitbox.isVisible = true
      dieHitbox.setEnabled(true)
      dieHitbox.position = d.mesh.position
      dieHitbox.rotationQuaternion = d.mesh.rotationQuaternion

      let vector = Dice.setVector3(0, 1, 0)
      if(d.dieType === 'd4' && d4FaceDown) {
        vector = Dice.setVector3(0, -1, 0)
      }

      Dice.ray.direction = vector
      Dice.ray.origin = die.mesh.position

      const picked = scene.pickWithRay(Dice.ray)

      dieHitbox.dispose()

      // let rayHelper = new RayHelper(Dice.ray)
      // rayHelper.show(d.config.scene)
			d.value = picked?.faceId !== undefined ? meshFaceIds[d.dieType][picked.faceId] : undefined
      const forcedFaceValue = Dice.getForcedFaceValue(d)
      const forcedValue = Dice.getForcedValue(d)
      if(forcedFaceValue !== undefined) {
        Dice.smoothForcedResult(d, scene, 1, true, true)
      }
      if(d.config?.forcedDiscarded) {
        Dice.fadeDiscarded(d)
      }
      if(forcedValue !== undefined && Number.isFinite(Number(forcedValue))) {
        d.value = Number(forcedValue)
      }
      if(d.value === undefined){
        // throw new Error(`colliderFaceMap Error: No value found for ${d.dieType} mesh face ${picked.faceId}`)
        // log error, but allow result processing to continue
        console.error(`colliderFaceMap Error: No value found for ${d.dieType} mesh face ${picked?.faceId}`)
        d.value = 0
      }

      return resolve(d.value)
    }).catch(error => console.error(error))

    if(!die.mesh){
      return die.value
    }
    
    return await getDieRoll()
  }
}

export default Dice
