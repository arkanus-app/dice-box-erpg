# Referência da API v2

[← Voltar ao README](../README.md)

Esta referência descreve a API pública de `@erpg/dice3dview` 2.1.1. A biblioteca é destinada ao navegador: a criação exige DOM; a inicialização do renderer exige WebGL.

## Exports públicos

```ts
export default DiceResultViewer

export {
  DiceResultViewer,
  DEFAULT_TIMELINE_OPTIONS,
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
  DisplayTimelineRequest,
  DisplayTimelineResult,
  DiceTimelineEvent,
  ResolvedDie,
  ResolvedThemeConfig,
  ThemeConfig,
  ThemeMaterialConfig,
  TimelineDieDefinition,
  TimelineEffectOptions,
  TimelineOptions,
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
  displayTimeline(request: DisplayTimelineRequest): Promise<DisplayTimelineResult>
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

### `displayTimeline(request)`

Apresenta um journal semântico já resolvido. Cada definição possui apenas identidade, lados e tema; as faces vêm dos eventos `roll`/`reroll`. O método valida todo o journal antes de limpar a cena: IDs, sequências positivas estritamente crescentes, rolls iniciais, referências, linhagem, ciclos e transições.

```ts
const result = await viewer.displayTimeline({
  id: 'explosao-1',
  dice: [
    { id: 'root', sides: 6 },
    { id: 'child', sides: 6 }
  ],
  events: [
    { sequence: 1, type: 'roll', subject: 'die', dieId: 'root', parentDieId: null, rollIndex: 1, sourceNodeId: 'n1', value: 6 },
    { sequence: 2, type: 'roll', subject: 'die', dieId: 'child', parentDieId: 'root', rollIndex: 1, sourceNodeId: 'n1', value: 4 },
    { sequence: 3, type: 'explode', subject: 'die', dieId: 'root', parentDieId: null, rollIndex: 1, sourceNodeId: 'n1', childDieId: 'child', value: 4, reason: 'explode' }
  ]
})
```

O retorno acrescenta `eventCount`, `phaseCount` e `degraded` ao contrato de `DisplayResult`. `dice` contém faces físicas válidas e estado final de descarte; totais `compound` e ajustes `penetrate` aparecem como badges, nunca como faces inexistentes.

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

Na moeda d2, a frente cuja normal local é `+Y` representa o valor `1` e usa quaternion `Identity`. O verso cuja normal local é `−Y` representa o valor `2` e usa rotação `π`. Esse referencial é fixo mesmo quando o tema troca as texturas por cara/coroa ou outros símbolos.

## `ViewerOptions`

### Timeline

`timeline.enabled` usa `true`; `maxEvents`, `maxDurationMs` e `phaseGapMs` usam `500`, `12000` e `180`. Cada efeito aceita `enabled`, `delayMs`, `durationMs`, `intensity` (`0..1`) e `color`. Opções especializadas:

| Efeito | Opções adicionais | Default |
|---|---|---|
| `explode` | `origin: 'source' \| 'edge'`, `burstHeight`, `spread` | `source`, `1.6`, `0.8` |
| `reroll`, `unique` | `style: 'hop' \| 'edge' \| 'spin'`, `hopHeight` | `hop`, `2.2` |
| `compound`, `penetrate` | `showBadge` | `true` |
| `criticalSuccess`, `criticalFailure` | `pulses` | `2` |

Também existem `keep`, `drop`, `success`, `failure` e `neutral`. Todos vêm ativos; `neutral` usa intensidade reduzida. Configurações inválidas são rejeitadas no construtor ou em `updateOptions()` sem substituir a configuração válida anterior.

```ts
await viewer.updateOptions({
  timeline: {
    maxDurationMs: 16_000,
    effects: {
      criticalSuccess: { enabled: false },
      reroll: { style: 'edge', durationMs: 650 },
      compound: { showBadge: false }
    }
  }
})
```

O merge é profundo por efeito: no exemplo, mudar `durationMs` não apaga `style`, `enabled`, cor ou intensidade. `timeline.enabled: false` e estouros de orçamento usam a apresentação plana final e retornam `degraded: true`.

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
| `delay` | `number` | `10` ms | intervalo de liberação por corpo nos dois modos |
| `wallPadding` | `number` | `0.25` | recuo interno entre a borda visível e a área útil, em unidades do palco |
| `spawnSpacing` | `number` | `1.72` | separação mínima solicitada para o packing de lanes na extremidade comum |
| `spawnHeightStep` | `number` | `0` | offset vertical opcional entre as primeiras entradas; zero mantém o grupo no mesmo plano |
| `spawnOverscan` | `number` | `0.15` | margem extra fora da projeção, como fração do raio, além do raio completo necessário para ocultar o corpo |

A duração cinemática efetiva é `max(250, duration) + maior launchDelayMs`. O atraso de cada corpo inclui `index × max(0, delay)` e, quando a capacidade simultânea se esgota, um intervalo automático entre waves suficiente para o wave anterior desocupar o portal.

`wallPadding` é aplicado aos lançamentos e pousos dos dois modos. Cada apresentação escolhe pela `seed` uma única borda comum entre esquerda, direita, topo e baixo, independentemente da proporção do canvas. O vetor principal sempre aponta para dentro dentro de um cone de 45 graus. O packing usa o raio real do collider para calcular o espaçamento efetivo, nunca menor que `spawnSpacing`, e preenche lanes tangenciais com até duas rows sucessivas atrás da borda recortada. Quando esses slots acabam, novos corpos entram em waves posteriores. Corpos da mesma wave não se sobrepõem no spawn; waves só reutilizam slots depois do intervalo necessário para liberar o portal. Por padrão não há degraus verticais; quando `spawnHeightStep` é positivo, ele adiciona offsets limitados às primeiras posições do grupo sem mudar a direção comum.

O centro inicial é colocado além da projeção no plano da altura de lançamento por `raio × (1 + max(0, spawnOverscan))`. Assim, `spawnOverscan: 0.15` posiciona o corpo um raio completo mais 15% do raio para fora do recorte, garantindo que nenhuma parte dele esteja visível antes de entrar.

`delay` escalona a entrada nos dois renderers. Em `kinematic`, o node só é habilitado na sua vez, gira livremente durante os primeiros 84% da trajetória e começa o settle para a face solicitada apenas nos 16% finais. Em `physics`, o corpo pendente permanece invisível, `ANIMATED` e sem velocidade. Na liberação ele se torna `DYNAMIC`, recebe de uma vez as velocidades linear e angular pré-calculadas e já colide com outros dados, com o piso e com as três paredes que não são o portal. Somente a parede de lançamento fica excluída até o collider inteiro cruzar para dentro da área útil. O timeout físico individual começa apenas depois da liberação.

No renderer físico, as faces internas das quatro paredes acompanham o recuo; o piso cobre a mesma área responsiva. As barreiras são invisíveis e seu collider de `0.25` unidade cresce para fora, portanto a face interna continua exatamente no limite calculado.

### Física

| Opção | Tipo | Default | Observação |
|---|---|---:|---|
| `gravity` | `number` | `1.3` | multiplica a gravidade `-9.81`; inicialização física |
| `mass` | `number` | `1.08` | massa base, multiplicada pelo perfil do dado |
| `startingHeight` | `number` | `7.6` | plano real e fixo de liberação; após offsets opcionais, a altura efetiva é limitada a `2.8–8.1` |
| `spinForce` | `number` | `5.8` | escala o plano angular seedado; no default produz as voltas por geometria descritas abaixo |
| `throwForce` | `number` | `6.4` | intensidade do kick linear imediato; coeficiente base `0.22`, cap base `17.5` e cap final `19.5` após a dinâmica da apresentação |
| `aggressiveThrowChance` | `number` | `0.12` | chance seedada por apresentação, entre `0` e `1`, de usar a cauda de maior energia e variação direcional; não seleciona paredes |
| `wallBounceChance` | `number` | alias deprecated | compatibilidade para `aggressiveThrowChance`; não garante nem solicita contato com parede |
| `colliderScale` | `number` | `1.02` | escala do collider e da altura de apoio dos poliedros; não altera a moeda |
| `friction` | `number` | `0.54` | fricção do piso e dos dados; não altera o material próprio das paredes |
| `restitution` | `number` | `0.29` | elasticidade do piso e dos dados; não altera o material próprio das paredes |
| `linearDamping` | `number` | `0.10` | amortecimento linear inicial |
| `angularDamping` | `number` | `0.08` | amortecimento angular aplicado depois do primeiro impacto; o preflight usa zero |
| `settleTimeout` | `number` | `4200` ms | janela de segurança, mínimo efetivo de 1000 ms; nunca decide o valor |
| `physicsWasmUrl` | `string` | `''` | URL explícita do WASM; inicialização física |

### Pipeline físico orientado ao resultado

A v2.0.4 adiciona `spawnOverscan` e `aggressiveThrowChance` e muda a execução de `mode: 'physics'`. `wallBounceChance` continua aceito somente como alias deprecated. Como o request já contém o valor autoritativo, o renderer usa essa informação somente para coreografar o movimento:

`startingHeight` não é mais um teto aplicado sobre uma altura aleatória inferior. Ele define diretamente o plano base de liberação nos dois renderers. Com os defaults, todos os corpos começam em `y = 7.6`; `spawnHeightStep: 0` evita a antiga diferença de altura entre entradas. Overrides continuam aceitos, mas o plano efetivo é confinado a `2.8–8.1` depois de aplicar o offset, protegendo o enquadramento e a perspectiva.

1. pré-calcula a face local, a altura de apoio e a duração balística;
2. cria um kick linear imediato, sem ease-in, e usa o torque excêntrico para determinar o sentido predominante do tumble;
3. limita o plano angular por número de voltas e velocidade média, então deriva uma pose inicial que ainda não expõe a face resolvida;
4. executa a trajetória quaternion móvel `q(t)` em plateau até 72% do voo e desacelera somente no trecho final, com integral exata compartilhada pelo preflight;
5. preserva twist/yaw em torno da face planejada e corrige somente o tilt causado por perturbações;
6. aplica ao grupo uma variação contínua de energia e direção; `aggressiveThrowChance` apenas seleciona a cauda mais intensa dessa distribuição;
7. aproxima a face com uma inclinação segura de aresta/canto, limita a velocidade vertical descendente e converge `x/z` no pouso disperso antes do primeiro contato;
8. habilita `angularDamping` depois do primeiro impacto e inicia a acomodação física guiada sem sobrescrever a resposta horizontal produzida por contatos reais.

Com `throwForce: 6.4`, a velocidade horizontal base usa `distance × force × 0.22`, respeita um impulso mínimo e é limitada a `17.5`. A variação contínua de energia/direção da apresentação e um pequeno fator por corpo podem elevá-la até o cap final `19.5`. Forças maiores aumentam o alcance projetado, sem transformar contato com parede em requisito. A gravidade continua acelerando a descida depois da liberação. O trecho inicial fora da projeção não altera o resultado planejado: ele apenas antecipa o ponto físico de spawn para que a entrada seja percebida como arremesso, e não como surgimento dentro do canvas.

`aggressiveThrowChance` é sorteado uma vez para a apresentação inteira. Quando selecionado, ele amplia a cauda de energia e o envelope angular compartilhado; cada corpo recebe apenas jitter contínuo menor. Aim e landing continuam confinados dentro das barreiras. Na distribuição de teste com o default, 75–93% das trajetórias projetadas são diretas. As demais podem projetar alcance até parede adjacente, parede oposta ou canto, mas o vetor não codifica uma categoria de impacto e somente o Havok decide se o corpo realmente toca uma barreira. Se as duas opções forem fornecidas, `aggressiveThrowChance` tem precedência sobre o alias `wallBounceChance`.

Depois de calcular o ETA balístico, o preflight deriva a viagem angular diretamente da velocidade planejada: `(vx × ETA, Δy, vz × ETA)`. Isso mantém tumble e inclinação de contato coerentes com o vetor real, inclusive quando sua projeção deixa de ser direta.

A auditoria da v1.0.6 mediu velocidades angulares instantâneas de aproximadamente `40–100 rad/s`. Esse regime não é copiado literalmente porque se mostrou instável na cena Havok atual. Com `spinForce: 5.8`, a v2.0.4 expressa o tumble por um número previsível de voltas e limita a velocidade angular média:

| Geometria | Voltas planejadas | Velocidade média máxima |
|---|---:|---:|
| d2 | 2,5 | 22 rad/s |
| d20 | 2,45 | 20 rad/s |
| demais poliedros | 2,35 | 20 rad/s |

O eixo resultante é predominantemente horizontal e transversal à viagem, reproduzindo o efeito do impulso fora do centro. Pequenas parcelas seedadas na direção da viagem e no eixo vertical preservam variação visual. As voltas são deliberadamente não inteiras: ao inverter o plano no preflight, a orientação inicial fica afastada do resultado e evita que a face resolvida já apareça no topo antes do primeiro frame físico.

A velocidade permanece em plateau até `72%` do voo. Somente nos `28%` finais ela desacelera por uma curva suave cuja integral analítica também normaliza o ângulo usado no preflight; assim, `q(1)` continua exatamente compatível com a pose de contato. O spin feed-forward planejado no contato é limitado a `2.6 rad/s`. Durante a aproximação, o freio linear nunca reduz o plano horizontal abaixo de `max(2.2, 0.4 × velocidade horizontal inicial)`.

Durante os primeiros 60% da acomodação, uma sustentação angular limitada e decrescente preserva a sensação de rolagem. Ela nunca reduz uma velocidade maior causada por uma colisão. Depois de qualquer contato com parede, piso ou outro dado, o soft landing deixa de reescrever `x/z` e preserva a resposta linear calculada pelo Havok; o damping normal da fase de settle continua podendo dissipá-la gradualmente. Depois desse trecho, os amortecimentos convergem progressivamente até seus valores de assentamento.

| Dado | Início do freio | Descida máxima | Duração do guidance | Lock normal elegível após |
|---|---:|---:|---:|---:|
| d2 | 80% | 1.4 | 1.450 ms | 1.900 ms |
| d4 | 83% | 2.0 | 1.900 ms | 2.400 ms |
| d6 | 86% | 2.5 | 1.850 ms | 2.300 ms |
| d8 | 86% | 2.6 | 1.800 ms | 2.300 ms |
| d10 | 85% | 2.2 | 1.750 ms | 2.300 ms |
| d12 | 86% | 2.6 | 1.800 ms | 2.300 ms |
| d20 | 92% | 3.6 | 1.700 ms | 2.400 ms |
| d100 | 85% | 2.2 | 1.750 ms | 2.300 ms |

O guidance pós-impacto possui limites próprios de velocidade e aceleração angular por geometria. O lock normal exige face dentro da tolerância, apoio e baixa velocidade durante a janela mínima acima. Dentro da zona morta natural (`0,024` radiano; `0,018` para d2), o motor deixa de corrigir tilt. Um contato tardio ou baixo com outro dado pode fornecer apoio; enquanto ainda é recente e instável ele bloqueia o lock, mas contato sustentado e estável é aceito.

Ao iniciar o lock normal, o renderer preserva a posição e o quaternion físicos atuais; não existe alinhamento exato de yaw/pose nem correção de altura no fim. A única exigência visual é manter a face recebida segura no topo. O caminho normal zera as velocidades nessa pose física e segue diretamente para `STATIC`, sem mudar o corpo para `ANIMATED` nem interpolá-lo através de vizinhos. Isso preserva pilhas e permite que dados já acomodados sirvam de suporte estável. Somente o fallback de timeout usa um `finalLock` `ANIMATED` de pelo menos 220 ms para corrigir até dentro do cone seguro, mantendo inclinação residual.

O lançamento ativa o corpo Havok antes de aplicar o impulso, preservando as velocidades planejadas. A resolução é adaptativa: `90 Hz` para um corpo, `180 Hz` para 2–24 e `120 Hz` para grupos maiores. Se o envelope do spawn estiver ocupado no instante previsto, a admissão é reavaliada nos subpassos seguintes sem desabilitar as colisões dos corpos já ativos. O fallback de timeout é executado individualmente, não começa durante colisão recente e volta a `DYNAMIC` quando uma correção animada encontra outro dado.

As paredes usam material interno fixo e independente: fricção `0.10` e restituição `0.54`. Se uma trajetória alcançar uma barreira, esse material permite uma resposta lateral viva sem reduzir a estabilidade do piso configurado pelas opções públicas; ele não força o contato.

Dados, piso e cada parede usam bits de membership distintos (`DICE`, `FLOOR` e um bit por lado). Durante a entrada, a máscara do dado contém `DICE`, `FLOOR`, as duas paredes adjacentes e a parede oposta, removendo apenas o bit da parede que funciona como portal. Por isso colisões dado-dado já existem desde a liberação. Depois que o collider cruza totalmente a face interna, o bit da parede de lançamento é restaurado. O preset de integração do frontend local acompanha `startingHeight: 7.6`, `throwForce: 6.4`, `spawnSpacing: 1.72`, `aggressiveThrowChance: 0.12` e `spawnOverscan: 0.15`.

`TELEPORT` é um caminho de recuperação excepcional para corpo fora do palco ou transformação não finita. Nem o preflight, nem o guidance, nem o timeout leem ou recalculam `value`; a face física é uma saída visual do valor recebido.

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
