# Referência da API v2

[← Voltar ao README](../README.md)

Esta referência descreve a API pública de `@erpg/dice3dview` 2.0.3. A biblioteca é destinada ao navegador: a criação exige DOM; a inicialização do renderer exige WebGL.

## Exports públicos

```ts
export default DiceResultViewer

export {
  DiceResultViewer,
  DISPLAY_CANCELLED_CODE,
  DisplayCancelledError,
  isDisplayCancelledError
}

export type {
  CoinFaceTheme,
  CoinTheme,
  CollisionEvent,
  DiceSides,
  DisplayMode,
  DisplayRequest,
  DisplayResult,
  ResolvedDie,
  ResolvedThemeConfig,
  ThemeConfig,
  ThemeMaterialConfig,
  ViewerOptions
}
```

O CSS é um subpath público separado:

```ts
import '@erpg/dice3dview/style.css'
```

## `DiceResultViewer`

```ts
class DiceResultViewer {
  readonly canvas: HTMLCanvasElement

  constructor(options?: ViewerOptions)
  init(): Promise<this>
  display(request: DisplayRequest): Promise<DisplayResult>
  clear(): void
  updateOptions(options: ViewerOptions): Promise<void>
  resize(): void
  dispose(): void
}
```

### `constructor(options)`

Cria e anexa imediatamente um canvas ao `container`. Embora `container` seja opcional no tipo por compatibilidade, ele precisa identificar um elemento existente.

Erros imediatos incluem ambiente sem `document`, container inexistente, `maxDice` inválido e modo inválido.

### `init()`

Inicializa o renderer do modo padrão, carrega o tema principal e os temas de `preloadThemes`, instala a observação de tamanho e devolve a própria instância. Chamadas repetidas são idempotentes.

`display()` chama `init()` automaticamente quando necessário.

### `display(request)`

Valida e normaliza os resultados, cancela qualquer apresentação ativa, seleciona o renderer e inicia a apresentação.

O retorno contém clones normalizados e congelados. Os números recebidos são preservados, mas os objetos não mantêm identidade referencial com os objetos de entrada.

```ts
const result = await viewer.display({
  id: 'ataque-7',
  dice: [{ id: 'd20-1', sides: 20, value: 18 }]
})

// {
//   id: 'ataque-7',
//   dice: [{
//     id: 'd20-1',
//     sides: 20,
//     value: 18,
//     discarded: false,
//     theme: 'default',
//     themeColor: '#2e8555'
//   }],
//   durationMs: ...
// }
```

`durationMs` inclui inicialização lazy, carregamento de temas e animação.

### `clear()`

Cancela a apresentação ativa, para o render loop e devolve meshes/moedas aos pools. A Promise da apresentação cancelada rejeita com `DisplayCancelledError`.

### `updateOptions(options)`

Mescla opções com a configuração atual, atualiza o repositório de temas e aplica opções compatíveis ao renderer.

Para alterar `container`, `id`, `antialias`, `shadowResolution`, `gravity`, `physicsWasmUrl` ou a raiz/definição de assets já carregados, descarte a instância e crie outra. `preloadThemes` só é consumido por `init()`.

### `resize()`

Recalcula o tamanho usando o canvas ou o elemento pai. Depois de `init()`, a instância observa automaticamente o container com `ResizeObserver` e também responde a `window.resize` como fallback.

Nos dois modos, o novo tamanho recalcula a área útil do palco. Em `physics`, piso e paredes são reconstruídos e corpos ativos que ficaram fora dos novos limites são confinados novamente.

### `dispose()`

Cancela a apresentação, remove o listener, libera renderer e recursos, e remove o canvas. `dispose()` é idempotente. Depois dele, não reutilize a instância; `init()`, `display()` e `updateOptions()` impedem explicitamente o reuso.

## Contratos de dados

```ts
type DiceSides = 2 | 4 | 6 | 8 | 10 | 12 | 20 | 100
type DisplayMode = 'kinematic' | 'physics'

interface ResolvedDie {
  readonly id: string
  readonly sides: DiceSides
  readonly value: number
  readonly discarded?: boolean
  readonly theme?: string
  readonly themeColor?: string
}

interface DisplayRequest {
  readonly id: string
  readonly dice: readonly ResolvedDie[]
  readonly seed?: string
  readonly mode?: DisplayMode
}

interface DisplayResult {
  readonly id: string
  readonly dice: readonly ResolvedDie[]
  readonly durationMs: number
}
```

### Normalização e validação

- `request.id` deve ser uma string não vazia;
- `dice` deve conter ao menos um item;
- os únicos modos são `kinematic` e `physics`;
- os únicos lados são d2, d4, d6, d8, d10, d12, d20 e d100;
- `value` deve ser inteiro finito entre `1` e `sides`;
- d2 aceita exclusivamente `1` ou `2`;
- um ID de dado vazio recebe `${request.id}-die-${index}`;
- `seed` usa `request.id` quando ausente;
- `discarded` usa `false` quando ausente;
- `theme` e `themeColor` usam os defaults do viewer;
- IDs duplicados não são rejeitados;
- em runtime, lados e valores passam por `Number()`, embora TypeScript exija números.

`maxDice` conta corpos visuais. d2–d20 usam um corpo; cada d100 usa dois.

## `ViewerOptions`

### Núcleo e temas

| Opção | Tipo | Default | Observação |
|---|---|---:|---|
| `id` | `string` | `dice-canvas-${Date.now()}` | ID do canvas; construção |
| `container` | `string \| HTMLElement \| null` | `null` | obrigatório na prática; construção |
| `assetPath` | `string` | `/assets/dice-box/` | raiz pública dos assets |
| `origin` | `string` | `window.location.origin` | origem para assets internos |
| `mode` | `DisplayMode` | `kinematic` | fallback quando o request não define modo |
| `theme` | `string` | `default` | tema padrão |
| `preloadThemes` | `readonly string[]` | `[]` | carregados durante `init()` |
| `externalThemes` | `Record<string, string>` | `{}` | mapa tema → URL base |
| `themeColor` | `string` | `#2e8555` | cor padrão dos poliedros |
| `maxDice` | `number` | `120` | inteiro positivo; conta corpos |

### Renderização

| Opção | Tipo | Default | Observação |
|---|---|---:|---|
| `enableShadows` | `boolean` | `true` | ativa cast/receive shadows |
| `shadowTransparency` | `number` | `0.8` | escuridão do shadow map |
| `shadowResolution` | `number` | `1024` | construção do shadow generator |
| `lightIntensity` | `number` | `1` | multiplicador das luzes |
| `antialias` | `boolean` | `true` | construção da engine Babylon |
| `scale` | `number` | `5` | escala dos objetos |
| `duration` | `number` | `1100` ms | duração cinemática base |
| `delay` | `number` | `8` ms | acréscimo por corpo cinemático |
| `wallPadding` | `number` | `1.35` | recuo interno entre a borda visível e a área útil, em unidades do palco |

A duração cinemática efetiva é `max(250, duration + (bodyCount - 1) × delay)`.

`wallPadding` é aplicado aos lançamentos e pousos dos dois modos. No renderer físico, as faces internas das quatro paredes acompanham esse recuo; o piso cobre a mesma área responsiva.

### Física

| Opção | Tipo | Default | Observação |
|---|---|---:|---|
| `gravity` | `number` | `1.85` | multiplica a gravidade `-9.81`; inicialização física |
| `mass` | `number` | `1.08` | massa base, multiplicada pelo perfil do dado |
| `startingHeight` | `number` | `6.4` | limite de altura do lançamento lateral |
| `spinForce` | `number` | `5.8` | giro inicial |
| `throwForce` | `number` | `4.55` | intensidade da velocidade de lançamento lateral |
| `colliderScale` | `number` | `1.02` | escala do collider e da altura de apoio dos poliedros; não altera a moeda |
| `friction` | `number` | `0.86` | material físico |
| `restitution` | `number` | `0.16` | elasticidade |
| `linearDamping` | `number` | `0.28` | amortecimento linear inicial |
| `angularDamping` | `number` | `0.24` | amortecimento angular inicial |
| `settleTimeout` | `number` | `4200` ms | mínimo efetivo de 1000 ms |
| `physicsWasmUrl` | `string` | `''` | URL explícita do WASM; inicialização física |

### Opções reservadas

As opções abaixo permanecem no contrato por compatibilidade, mas não alteram o renderer 2.0.3:

| Opção | Default |
|---|---:|
| `spawnSpacing` | `0.72` |
| `spawnHeightStep` | `0.18` |

### Callbacks

```ts
interface CollisionEvent {
  readonly action: 'collision'
  readonly body0Id?: string
  readonly body1Id?: string
  readonly force: number
}
```

| Callback | Momento |
|---|---|
| `onCollision(event)` | colisões no modo físico |
| `onThemeConfigLoaded(theme)` | configuração resolvida quando ainda não estava no cache |
| `onThemeLoaded(theme)` | uma vez por tema distinto usado na apresentação |

Todos usam uma função vazia por padrão.

## Cancelamento

```ts
import {
  DISPLAY_CANCELLED_CODE,
  DisplayCancelledError,
  isDisplayCancelledError
} from '@erpg/dice3dview'
```

`DISPLAY_CANCELLED_CODE` vale `DISPLAY_CANCELLED`.

Uma nova apresentação ou `clear()` aborta a anterior. O helper reconhece tanto uma instância da classe quanto um objeto externo que contenha o mesmo código:

```ts
try {
  await viewer.display(request)
} catch(error) {
  if(isDisplayCancelledError(error)) return
  throw error
}
```

## Falhas e autoridade do resultado

Existem três categorias:

1. **Entrada inválida:** rejeita antes da apresentação.
2. **Cancelamento:** rejeita com `DisplayCancelledError`.
3. **Falha gráfica, de asset ou física durante a apresentação:** registra o erro e devolve o resultado normalizado.

Em nenhum caso a biblioteca sorteia um valor substituto. O resultado do chamador continua autoritativo.

## Assets e resolução de URLs

Por padrão:

```text
tema interno:  ${origin}${assetPath}themes/${theme}/theme.config.json
modelo padrão: ${origin}${assetPath}themes/default/default.json
Havok WASM:    ${origin}${assetPath}havok/HavokPhysics.wasm
```

Exemplo com CDN:

```ts
const viewer = new DiceResultViewer({
  container: '#dice-stage',
  origin: 'https://static.example.com',
  assetPath: '/erpg/dice-box/',
  physicsWasmUrl: 'https://static.example.com/erpg/dice-box/havok/HavokPhysics.wasm',
  externalThemes: {
    bronze: 'https://static.example.com/themes/bronze'
  }
})
```

O servidor deve permitir CORS para temas externos e servir `.wasm` preferencialmente como `application/wasm`.

## SSR e frameworks

O módulo pode ser referenciado por tipos em código universal, mas a instância precisa ser criada no cliente:

```ts
if(typeof window !== 'undefined') {
  const { DiceResultViewer } = await import('@erpg/dice3dview')
  const viewer = new DiceResultViewer({ container: '#dice-stage' })
  await viewer.init()
}
```

Em React, Vue ou Svelte, crie a instância após o elemento existir e chame `dispose()` no cleanup.
