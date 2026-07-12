# Temas da v2

[← Voltar ao README](../README.md)

Um tema controla materiais dos poliedros e aparência da moeda. Ele pode reutilizar o modelo padrão ou fornecer seu próprio modelo Babylon serializado.

## Estrutura recomendada

```text
assets/dice-box/themes/bronze/
├── theme.config.json
├── bronze.json
├── diffuse-light.webp
├── diffuse-dark.webp
├── normal.webp
├── coin-front.webp
└── coin-back.webp
```

## Configuração completa

```json
{
  "name": "Bronze",
  "systemName": "bronze",
  "meshFile": "bronze.json",
  "material": {
    "type": "color",
    "diffuseTexture": {
      "light": "diffuse-light.webp",
      "dark": "diffuse-dark.webp"
    },
    "diffuseLevel": 1,
    "bumpTexture": "normal.webp",
    "bumpLevel": 0.5
  },
  "diceAvailable": ["d2", "d4", "d6", "d8", "d10", "d12", "d20", "d100"],
  "coin": {
    "front": { "value": 1, "texture": "coin-front.webp" },
    "back": { "value": 2, "texture": "coin-back.webp" },
    "edgeColor": "#a66b2b",
    "diameter": 1,
    "thickness": 0.12
  }
}
```

`material` e `diceAvailable` são obrigatórios. `name`, `systemName`, `meshFile` e `coin` são opcionais.

## Materiais

```ts
interface ThemeMaterialConfig {
  readonly type: 'color' | 'standard'
  readonly diffuseTexture?: string | {
    readonly light: string
    readonly dark: string
  }
  readonly bumpTexture?: string
  readonly specularTexture?: string
  readonly diffuseLevel?: number
  readonly bumpLevel?: number
  readonly specularPower?: number
}
```

### `type: "color"`

Usa `themeColor` como cor base. A textura diffuse funciona como máscara alfa para preservar os números e detalhes. Quando `diffuseTexture` possui variantes `light` e `dark`, o renderer escolhe a variante a partir da luminosidade de `themeColor`.

### `type: "standard"`

Usa a cor da própria textura/material. `themeColor` não substitui o diffuse principal.

### Campos sem efeito atual

`specularPower` permanece no contrato, mas ainda não é aplicado pelo renderer 2.0.2. `ThemeConfig.extends` também é aceito como metadado, sem executar herança automática.

## Resolução de caminhos

Texturas relativas são resolvidas a partir da pasta do tema. Para texturas, também são aceitos:

- URLs HTTP ou HTTPS;
- data URLs;
- caminhos iniciados em `/`.

`meshFile` é sempre tratado como um caminho relativo à pasta do tema. Para hospedar um modelo em outra origem, aponte a própria pasta do tema por `externalThemes` e use um nome de arquivo relativo dentro dela.

Exemplo de tema que reutiliza os assets do tema padrão:

```json
{
  "name": "Default V2",
  "systemName": "default-v2",
  "material": {
    "type": "color",
    "diffuseTexture": {
      "light": "../default/diffuse-light.webp",
      "dark": "../default/diffuse-dark.webp"
    },
    "bumpTexture": "../default/normal.webp"
  },
  "diceAvailable": ["d2", "d4", "d6", "d8", "d10", "d12", "d20", "d100"]
}
```

Quando `meshFile` não é informado, o renderer usa `themes/default/default.json`. Quando `coin` não é informado, usa as texturas numéricas de `themes/default`.

## Moeda d2

```ts
interface CoinTheme {
  readonly front: { readonly value: 1; readonly texture: string }
  readonly back: { readonly value: 2; readonly texture: string }
  readonly edgeColor?: string
  readonly diameter?: number
  readonly thickness?: number
}
```

O contrato numérico é fixo:

- frente → valor `1`;
- verso → valor `2`.

A geometria usa um cilindro e dois discos procedurais com 48 segmentos. `diameter` tem mínimo efetivo de `0.3`; `thickness`, de `0.04`. Uma moeda descartada usa visibilidade reduzida.

`themeColor` não recolore a moeda. Use as texturas e `edgeColor` do próprio tema.

## Modelo dos poliedros

O JSON precisa oferecer:

```ts
interface BabylonModelSource {
  meshes: Record<string, unknown>[]
  colliderFaceMap: Record<string, Record<string, number>>
}
```

Para cada tipo, forneça:

- malha visual chamada `d4`, `d6`, `d8`, `d10`, `d12`, `d20` e/ou `d100`;
- collider correspondente chamado `d4_collider`, `d6_collider` etc.;
- entrada de mesmo tipo em `colliderFaceMap`.

Se meshes/collider `d100` não existirem, o loader pode reutilizar os templates de `d10`. O mapa `colliderFaceMap.d100` continua obrigatório para associar as faces às dezenas `00–90`.

O mapa associa o índice de cada triângulo do collider ao valor da face. O renderer agrega as normais dos triângulos do valor solicitado e pré-calcula o quaternion que leva essa face à direção correta.

O d4 é especial: o valor é determinado pela face apoiada para baixo. Nos demais dados, a face selecionada aponta para cima.

`diceAvailable` é validado somente como um array obrigatório e não bloqueia a criação. A disponibilidade efetiva dos poliedros depende das malhas, colliders e mapas presentes no modelo; d2 é sempre procedural.

## Temas externos

```ts
const viewer = new DiceResultViewer({
  container: '#dice-stage',
  externalThemes: {
    bronze: 'https://cdn.example.com/dice-themes/bronze',
    ice: 'https://cdn.example.com/dice-themes/ice'
  }
})

await viewer.display({
  id: 'mixed-themes',
  dice: [
    { id: 'a', sides: 20, value: 18, theme: 'bronze' },
    { id: 'b', sides: 6, value: 4, theme: 'ice' }
  ]
})
```

Cada URL deve apontar para uma pasta que contenha `theme.config.json`. Configure CORS para o domínio da aplicação.

## Cache e callbacks

- configurações são cacheadas por nome de tema;
- modelos são cacheados por `meshName`;
- materiais são cacheados por tema, cor e estado descartado;
- orientações e alturas de apoio são cacheadas por modelo, tipo e valor;
- `onThemeConfigLoaded` ocorre quando uma configuração é resolvida fora do cache;
- `onThemeLoaded` ocorre uma vez por tema distinto usado em cada apresentação.

Alterar `assetPath`, `origin` ou `externalThemes` por `updateOptions()` limpa o cache de configurações. Templates de mesh, materiais e moedas já carregados pertencem ao renderer e permanecem cacheados; para substituir a definição de um mesmo tema/mesh com segurança, descarte o viewer e crie outro.

## Checklist de um tema

1. `theme.config.json` responde com HTTP 200.
2. `material` e `diceAvailable` existem.
3. Todos os caminhos relativos partem da pasta do tema.
4. O modelo contém mesh visual, collider e mapa para cada poliedro usado.
5. Valores do `colliderFaceMap` cobrem todas as faces esperadas.
6. Frente e verso da moeda mantêm os valores `1` e `2`.
7. Assets externos permitem CORS.
8. O tema foi testado nos modos `kinematic` e `physics`.
