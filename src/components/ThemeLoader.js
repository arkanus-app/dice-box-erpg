import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { CustomMaterial } from '@babylonjs/materials/custom/customMaterial';
import { deepCopy } from '../helpers'

// Monkey-patch for cloning CustomMaterial in BabylonJS v7+
// SerializationHelper.Clone was removed in v7, replaced with manual copy
CustomMaterial.prototype.clone = function (name)  {
  const th = this
  const result = new CustomMaterial(name, this.getScene())

  result.name = name
  result.id = name
  result.diffuseColor = th.diffuseColor?.clone?.() || th.diffuseColor
  result.specularColor = th.specularColor?.clone?.() || th.specularColor
  result.emissiveColor = th.emissiveColor?.clone?.() || th.emissiveColor
  result.ambientColor = th.ambientColor?.clone?.() || th.ambientColor
  result.diffuseTexture = th.diffuseTexture
  result.bumpTexture = th.bumpTexture
  result.specularTexture = th.specularTexture
  result.allowShaderHotSwapping = th.allowShaderHotSwapping
  result.CustomParts.Fragment_Begin = th.CustomParts.Fragment_Begin
  result.CustomParts.Fragment_Definitions = th.CustomParts.Fragment_Definitions
  result.CustomParts.Fragment_MainBegin = th.CustomParts.Fragment_MainBegin
  result.CustomParts.Fragment_Custom_Diffuse = th.CustomParts.Fragment_Custom_Diffuse
  result.CustomParts.Fragment_Before_Lights = th.CustomParts.Fragment_Before_Lights
  result.CustomParts.Fragment_Before_Fog = th.CustomParts.Fragment_Before_Fog
  result.CustomParts.Fragment_Custom_Alpha = th.CustomParts.Fragment_Custom_Alpha
  result.CustomParts.Fragment_Before_FragColor = th.CustomParts.Fragment_Before_FragColor
  result.CustomParts.Vertex_Begin = th.CustomParts.Vertex_Begin
  result.CustomParts.Vertex_Definitions = th.CustomParts.Vertex_Definitions
  result.CustomParts.Vertex_MainBegin = th.CustomParts.Vertex_MainBegin
  result.CustomParts.Vertex_Before_PositionUpdated = th.CustomParts.Vertex_Before_PositionUpdated
  result.CustomParts.Vertex_Before_NormalUpdated = th.CustomParts.Vertex_Before_NormalUpdated
  result.CustomParts.Vertex_After_WorldPosComputed = th.CustomParts.Vertex_After_WorldPosComputed
  result.CustomParts.Vertex_MainEnd = th.CustomParts.Vertex_MainEnd

  return result
}

class ThemeLoader {
  loadedThemes = {}
  themeData = {}
  constructor(options) {
    this.scene = options.scene
  }

  async loadStandardMaterial(options) {
    const {theme, material: matParams} = options
    const diceMaterial = new StandardMaterial(theme, this.scene);

    if(matParams.diffuseTexture){
      diceMaterial.diffuseTexture = await this.getTexture('diffuse', options)
    }
    if(matParams.bumpTexture){
      diceMaterial.bumpTexture = await this.getTexture('bump', options)
    }
    if(matParams.specularTexture){
      diceMaterial.specularTexture = await this.getTexture('specular', options)
    }

    diceMaterial.allowShaderHotSwapping = false
  }

  async loadColorMaterial(options) {
    const {theme, material: matParams} = options
    const diceMatLight = new CustomMaterial(theme+'_light',this.scene)
    const opts = deepCopy(options)
    if(matParams.diffuseTexture && matParams.diffuseTexture.light){
      opts.material.diffuseTexture = options.material.diffuseTexture.light
      diceMatLight.diffuseTexture = await this.getTexture('diffuse', opts)
    }
    if(matParams.bumpTexture){
      diceMatLight.bumpTexture = await this.getTexture('bump', options)
    }
    if(matParams.specularTexture){
      diceMatLight.specularTexture = await this.getTexture('specular', options)
    }
  
    diceMatLight.allowShaderHotSwapping = false
  
    diceMatLight.Vertex_Definitions(`
      attribute vec3 customColor;
      varying vec3 vColor;
    `)
    .Vertex_MainEnd(`
      vColor = customColor;
    `)
    .Fragment_Definitions(`
      varying vec3 vColor;
    `)
    .Fragment_Custom_Diffuse(`
      baseColor.rgb = mix(vColor.rgb, baseColor.rgb, baseColor.a);
    `)

    diceMatLight.AddAttribute('customColor')
  
    const diceMatDark = diceMatLight.clone(theme+'_dark')
    if(matParams.diffuseTexture && matParams.diffuseTexture.dark){
      opts.material.diffuseTexture = options.material.diffuseTexture.dark
      diceMatDark.diffuseTexture = await this.getTexture('diffuse', opts)
    }
    diceMatDark.AddAttribute('customColor')
  }

  async getTexture(type, options){
    const {basePath, material: matParams, theme} = options
    let texture
    const level = type + 'Level'
    const textureKey = type + 'Texture'
    switch (type) {
      case "diffuse":
        texture = await this.importTextureAsync(`${basePath}/${matParams[textureKey]}`, theme)
        if(matParams[level]) {
          texture.level = matParams[level]
        }
        break;
      case "bump":
        texture = await this.importTextureAsync(`${basePath}/${matParams[textureKey]}`, theme)
        if(matParams[level]) {
          texture.level = matParams[level]
        }
        break;
      case "specular":    
          texture = await this.importTextureAsync(`${basePath}/${matParams[textureKey]}`, theme)
          if(matParams.specularPower){
            texture.specularPower = matParams.specularPower
          }
        break;
    
      default:
        throw new Error(`Texture type: ${type} is not supported`)
    }
    return texture
  }

  async importTextureAsync(url,theme) {
    return new Promise((resolve, reject) => {
      let fileName = url.match(/^(.*\/)(.*)$/)
      let texture = new Texture(
          url,
          this.scene,
          undefined,
          true,
          undefined,
          () => resolve(texture),
          () => reject(new Error(`Unable to load texture '${fileName[2]}' for theme: '${theme}'. Check that your assetPath is configured correctly and that the files exist at path: '${fileName[1]}'`))
        )
    })
  }

  async load(options){
    const { material } = options

    if(material.type === "color") {
      await this.loadColorMaterial(options)
    } 
    else if (material.type === "standard") {
      await this.loadStandardMaterial(options)
    } 
    else {
      throw new Error(`Material type: ${material.type} not supported`)
    }
  }
}

export default ThemeLoader
