# @erpg/dice3dview

Camada TypeScript de apresentação 3D para resultados de dados já resolvidos.

O `@erpg/dicecore` interpreta a fórmula e decide os resultados; o `@erpg/dice3dview` recebe esses valores prontos e apenas os apresenta. A biblioteca não interpreta notação, não sorteia valores e não usa a face física como fonte do resultado.

Versão atual: **2.2.1**.

## Documentação

- [Referência completa da API](docs/API.md)
- [Criação e hospedagem de temas](docs/THEMES.md)
- [Migração da v1 para a v2](docs/MIGRATION_V2.md)
- [Devlog da v2](DEVLOG_V2.md)
- [Changelog](CHANGELOG.md)
- [Origem e diferenças do fork](FORK.md)

## O que a v2 oferece

- API pública TypeScript estrita e declarações incluídas no pacote;
- pipeline exclusivamente visual, com o resultado externo como única autoridade;
- `d2` nativo como moeda procedural configurável por tema;
- `d4`, `d6`, `d8`, `d10`, `d12`, `d20` e `d100`;
- modo cinemático leve como padrão, sem Havok no grafo inicial;
- modo físico lazy com colisões desde a liberação, variação seedada de energia/direção, preflight orientado ao resultado, stacking e aterrissagem guiada na face solicitada;
- palco responsivo, com piso e quatro barreiras invisíveis finas ajustados ao tamanho real do canvas;
- nos dois modos, arremesso de grupo por uma borda comum escolhida entre as quatro, com o corpo inteiro começando fora da projeção, entrada sequencial e posições finais dispersas; no cinemático, a trajetória também é determinística por `seed`;
- cancelamento tipado, cache de temas/modelos/materiais e pools de meshes;
- timeline semântica opcional para explosões, rerolls, unique, compound, penetrate, keep/drop e classificações;
- um entrypoint ESM com chunks lazy, CSS público e tipos TypeScript;
- orçamento automatizado de até 8 MiB para toda a distribuição.

## Instalação

Instale a versão publicada no npm:

```bash
npm install @erpg/dice3dview
```

Para consumir diretamente uma tag do repositório:

```bash
npm install github:arkanus-app/dice-box-erpg#v2.2.1
```

Em `package.json`:

```json
{
  "dependencies": {
    "@erpg/dice3dview": "^2.2.1"
  }
}
```

## Assets obrigatórios

O JavaScript não embute modelos, texturas nem o WASM do Havok. Disponibilize o conteúdo abaixo na aplicação consumidora:

```text
node_modules/@erpg/dice3dview/dist/assets/dice-box/
```

No caminho público correspondente, por padrão:

```text
public/assets/dice-box/
├── havok/HavokPhysics.wasm
└── themes/
    ├── default/
    └── default-v2/
```

Também importe o CSS estável do canvas:

```ts
import '@erpg/dice3dview/style.css'
```

Se os arquivos forem hospedados em outro endereço, configure `assetPath`, `origin` ou `physicsWasmUrl`. Consulte [Assets e resolução de URLs](docs/API.md#assets-e-resolução-de-urls).

## Início rápido

```html
<div id="dice-stage"></div>

<style>
  #dice-stage {
    position: fixed;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
</style>
```

```ts
import { DiceResultViewer, isDisplayCancelledError } from '@erpg/dice3dview'
import '@erpg/dice3dview/style.css'

const viewer = new DiceResultViewer({
  container: '#dice-stage',
  assetPath: '/assets/dice-box/',
  theme: 'default',
  themeColor: '#ff0a7a',
  mode: 'kinematic'
})

await viewer.init()

try {
  const presentation = await viewer.display({
    id: 'resultado-42',
    seed: 'animacao-42',
    dice: [
      { id: 'moeda', sides: 2, value: 1 },
      { id: 'ataque', sides: 20, value: 17 },
      { id: 'descartado', sides: 6, value: 2, discarded: true }
    ]
  })

  console.log(presentation.dice, presentation.durationMs)
} catch(error) {
  if(!isDisplayCancelledError(error)) throw error
}
```

`container` aparece como opcional no tipo por compatibilidade de construção, mas é obrigatório na prática: ele deve apontar para um elemento existente quando o viewer for criado.

## Integração com `@erpg/dicecore`

O adaptador fica deliberadamente na aplicação. Isso mantém parsing, regras, explosões, rerolls e descartes fora do renderer:

```ts
import { rollRpgDice } from '@erpg/dicecore'
import { DiceResultViewer, type DiceSides } from '@erpg/dice3dview'

const supportedSides = new Set<DiceSides>([2, 4, 6, 8, 10, 12, 20, 100])

const isDisplaySide = (value: unknown): value is DiceSides =>
  typeof value === 'number' && supportedSides.has(value as DiceSides)

const roll = rollRpgDice('4d6kh3 + 2')
const requestId = crypto.randomUUID()

const dice = roll.dice.flatMap(die => isDisplaySide(die.sides)
  ? [{
      id: die.id,
      sides: die.sides,
      value: die.value,
      discarded: !die.included
    }]
  : [])

if(dice.length > 0) {
  await viewer.display({
    id: requestId,
    seed: requestId,
    dice,
    mode: 'physics'
  })
}
```

O `seed` nunca altera `value`. No modo cinemático ele torna trajetória, posição e rotação reproduzíveis; no modo físico ele determina condições visuais iniciais, mas colisões e timing podem produzir posições finais diferentes.

### Timeline semântica

Quando o journal de `@erpg/dicecore` está disponível, passe as definições e os eventos diretamente para `displayTimeline()`. O pacote é estruturalmente compatível com os eventos, mas não depende do core em runtime:

```ts
const viewer = new DiceResultViewer({
  container: '#dice-stage',
  onTimelineProgress(progress) {
    // Emitido somente quando a etapa visual correspondente estabilizou.
    updateRollCard(progress.dice, progress.stage)
  },
  timeline: {
    effects: {
      criticalSuccess: { enabled: false },
      explode: { origin: 'source', durationMs: 900 },
      reroll: { style: 'hop', hopHeight: 2.2 }
    }
  }
})

await viewer.displayTimeline({
  id: requestId,
  seed: requestId,
  mode: 'physics',
  dice: roll.dice.flatMap(die => isDisplaySide(die.sides)
    ? [{ id: die.id, sides: die.sides }]
    : []),
  events: roll.events.filter(event => event.subject === 'die')
})
```

Todos os efeitos podem ser desligados ou ajustados por instância. `updateOptions({ timeline: ... })` faz merge profundo por efeito. Desligar um efeito remove apenas sua coreografia; a face física, o descarte e o resultado final continuam autoritativos. Se `timeline.enabled` for `false`, o journal exceder `maxEvents` ou a duração estimada exceder `maxDurationMs`, a apresentação degrada antes de começar para uma rolagem plana com o estado final.

`onTimelineProgress` é opcional e também pode ser trocado por
`updateOptions()`. Ele recebe snapshots imutáveis em `initial`, depois de cada
`phase` e em `complete`, incluindo os dados visíveis e as sequências do journal
já concluídas. Assim cards e overlays podem incrementar resultados em sincronia
com a física, sem timers externos. Erros do callback são isolados da animação.

## Dados suportados

| Tipo | Valores aceitos | Representação |
|---|---:|---|
| d2 | 1–2 | moeda procedural; `1` é frente e `2` é verso |
| d4 | 1–4 | poliedro |
| d6 | 1–6 | poliedro |
| d8 | 1–8 | poliedro |
| d10 | 1–10 | poliedro |
| d12 | 1–12 | poliedro |
| d20 | 1–20 | poliedro |
| d100 | 1–100 | um resultado semântico apresentado por dois corpos |

Valores precisam ser inteiros finitos dentro do intervalo. O d2 aceita exclusivamente `1` ou `2`. Não há d3 nativo; se necessário, a aplicação pode apresentá-lo em um d6, mantendo o valor 1–3.

O limite padrão é de 120 **corpos visuais**. Como um d100 usa dois corpos, 60d100 atingem esse limite.

## Modos de apresentação

| Característica | `kinematic` | `physics` |
|---|---|---|
| Padrão | sim | não |
| Havok/WASM | não é carregado | carregado sob demanda |
| Colisões | não | sim |
| Trajetória | arco dirigido desde fora da projeção, com giro livre até 84% | preflight orientado ao resultado, entrada por portal físico, gravidade e paredes |
| Face final | settle determinístico somente nos 16% finais | chegada planejada, acomodação guiada e commit físico suave |
| Uso indicado | overlays e alto volume | rolagens com sensação física |

No modo físico, cada formato possui parâmetros pré-calculados de massa, tempo de acomodação, força angular, aceleração máxima e pouso vertical. Antes de criar o corpo Havok, o renderer usa o valor já resolvido para montar um preflight visual: calcula a duração balística e escolhe uma pose inicial cuja trajetória `q(t)` termina na face solicitada. Aim e landing permanecem internos; o eixo de viagem usado no plano vem do deslocamento projetado pela velocidade real durante o ETA (`velocity × ETA`).

A entrada rápida foi recuperada a partir de uma auditoria da v1.0.6 (`81c2ca9`). A v1 não acelerava o dado gradualmente: a sensação de arremesso vinha de um impulso descendente aplicado de uma vez e de torque excêntrico. A instrumentação desse caminho encontrou velocidades angulares instantâneas de aproximadamente `40–100 rad/s`, uma faixa instável quando transposta diretamente para a cena Havok atual. Na v2, `createThrownLinearVelocity` reproduz o kick linear sem ease-in, enquanto o giro visível usa um plano limitado. Com `throwForce: 6.4`, a velocidade horizontal base usa coeficiente `0.22` e cap `17.5`; a variação contínua de energia e direção pode elevá-la até o cap final `19.5`. Aumentar `throwForce` aumenta o alcance projetado, sem forçar contato com uma parede.

O torque excêntrico histórico ainda define o sentido do tumble, mas sua apresentação é normalizada por voltas completas: `2,35` nos demais poliedros, `2,45` no d20 e `2,5` no d2. A velocidade angular média fica limitada a `20 rad/s` nos poliedros e `22 rad/s` na moeda. O eixo é predominantemente horizontal, como num arremesso fora do centro, com pequenas parcelas seedadas na direção da viagem e no twist para evitar lançamentos idênticos. As quantidades não inteiras de voltas são deliberadas: elas impedem que a face resolvida já nasça apontada para cima antes de a física agir.

A curva física mantém um plateau de velocidade até 72% do voo e desacelera suavemente apenas no trecho final. A integral dessa curva é calculada exatamente e usada pelo preflight, portanto a mudança de velocidade não altera o ângulo total necessário para chegar à face solicitada. O spin planejado no primeiro contato é limitado a `2,6 rad/s`: há giro visível durante a queda e energia residual para a primeira aresta, sem reintroduzir os picos da v1. A aproximação usa uma inclinação pequena e segura para tocar primeiro por uma aresta ou canto. O feed-forward acompanha a pose móvel sem antecipar a face final; ele preserva o twist/yaw em torno da face planejada e remove somente o tilt introduzido por perturbações.

No modo `kinematic`, a mesma preocupação visual é aplicada sem Havok: o dado gira sem interpolar para o resultado durante os primeiros 84% da trajetória, e o settle para a face solicitada começa apenas nos 16% finais.

Depois do impacto, uma sustentação angular limitada e decrescente atua durante os primeiros 60% da acomodação. Ela mantém a rolagem visível sem substituir colisões reais e nunca reduz uma velocidade maior produzida pelo Havok. Assim que ocorre qualquer contato com parede, piso ou outro dado, o soft landing também deixa de substituir a resposta horizontal: o `x/z` calculado pelo Havok é preservado e só o damping normal do settle o dissipa progressivamente. Os amortecimentos padrão são `linearDamping: 0.10` e `angularDamping: 0.08`; o piso usa `friction: 0.54` e `restitution: 0.29`.

O fluxo interno é:

```text
preflight result-aware → freeFall/q(t) → guidedSettle → commit normal → complete
                                               ↘ finalLock (fallback) ↗
```

A orientação continua sendo corrigida no corpo Havok. Depois do impacto, o guidance limita a mudança de velocidade angular em cada subpasso e não permite acomodação prematura: a janela mínima é de 1.900 ms para d2, 2.400 ms para d4/d20 e 2.300 ms para os demais formatos. O commit normal congela diretamente a posição e o yaw/twist físicos atuais e torna o corpo `STATIC`, sem passagem por `ANIMATED`; basta a face correta estar segura no topo. Como nenhum dado é interpolado através dos vizinhos, pilhas continuam apoiadas e dados acomodados podem sustentar os seguintes. `finalLock` animado fica restrito ao fallback, e `TELEPORT` à recuperação de transformações inválidas ou corpos que escaparam do palco.

O corpo Havok é ativado antes de receber as velocidades do arremesso; isso é importante porque a transição de `ALWAYS_INACTIVE` para `ALWAYS_ACTIVE` limpa velocidades nativas. Em grupos de 2–24 corpos, o solver passa automaticamente a `180 Hz`; acima disso usa `120 Hz`, enquanto uma apresentação unitária permanece em `90 Hz`. Antes de habilitar um dado atrasado, uma porta de admissão verifica os raios circunscritos dos corpos já lançados e adia somente os subpassos necessários quando o spawn ainda está ocupado. O fallback final também é serializado e aborta sua correção animada se detectar contato com outro dado, devolvendo o corpo ao Havok dinâmico para separação real.

As quatro barreiras possuem collider invisível de apenas `0.25` unidade e material independente (`friction: 0.10`, `restitution: 0.54`). Com `wallPadding: 0.25`, uma colisão eventual acontece próxima ao limite visível sem criar a sensação de uma parede grossa. `aggressiveThrowChance: 0.12` é sorteado uma vez por apresentação e seleciona somente a cauda de maior energia e variação direcional compartilhada pelo grupo. Ele não escolhe parede, canto ou ponto de impacto. O landing continua dentro das barreiras e o vetor varia de forma contínua a partir dele. Na distribuição testada, 75–93% das trajetórias projetadas permanecem diretas; as demais podem ter alcance para uma parede adjacente, a oposta ou um canto, mas somente o Havok decide se haverá contato real. `wallBounceChance` permanece apenas como alias deprecated e também não garante colisão.

O spawn usa um raio completo além do recorte da câmera mais `spawnOverscan: 0.15`, isto é, uma margem extra equivalente a 15% do raio do corpo. Por isso o dado não nasce pronto dentro do canvas: ele aparece progressivamente ao cruzar a extremidade. No modo físico, somente a parede de lançamento é removida temporariamente da máscara do dado. Piso, outros dados e as três paredes restantes colidem desde a liberação; o bit da parede-portal volta assim que o collider inteiro entra no palco.

Grupos usam `delay: 10` ms por corpo. Os objetos que ainda aguardam sua vez permanecem invisíveis e sem colisão. O packing usa o raio real de cada collider e `spawnSpacing: 1.72` para preencher lanes tangenciais e até duas rows atrás da borda. Quando os slots simultâneos acabam, novas waves reutilizam o espaço somente depois que a anterior teve tempo de liberar o portal. `startingHeight: 7.6` é o plano real e fixo de liberação para todo o arremesso. O default `spawnHeightStep: 0` mantém o grupo no mesmo plano; quem quiser variação vertical pode configurar um offset positivo. A altura efetiva, incluindo esse offset opcional, é limitada internamente a `2.8–8.1` para preservar uma perspectiva segura.

O preset de física do frontend local acompanha os defaults da biblioteca, incluindo `startingHeight: 7.6`, `throwForce: 6.4`, `spawnSpacing: 1.72`, `aggressiveThrowChance: 0.12` e `spawnOverscan: 0.15`.

A face visível faz parte da trajetória desde o lançamento — não há troca de textura no último frame. O valor também não é lido de volta da cena: `@erpg/dicecore` continua sendo a única autoridade do resultado.

## d2 como moeda

A moeda usa cilindro e duas faces gerados em runtime, sem adicionar uma nova malha ao modelo principal:

```json
{
  "coin": {
    "front": { "value": 1, "texture": "coin-heads.webp" },
    "back": { "value": 2, "texture": "coin-tails.webp" },
    "edgeColor": "#c89b3c",
    "diameter": 1,
    "thickness": 0.12
  }
}
```

Temas podem usar números, cara/coroa, brasões ou qualquer outra arte. Os valores internos continuam sendo `1` e `2`. Se o bloco `coin` não existir, o tema recebe a moeda numérica padrão.

O mapeamento geométrico é fixo: a frente com normal local `+Y` usa `Identity` e representa o valor `1`; o verso com normal local `−Y` usa rotação `π` e representa o valor `2`. A validação visual confirmou `1d2[2]` exibindo a textura do verso/valor 2.

Veja a configuração completa em [Temas](docs/THEMES.md).

## Ciclo de vida

```ts
await viewer.init()
await viewer.display(request)
viewer.clear()
await viewer.updateOptions({ themeColor: '#7c3aed' })
viewer.resize()
viewer.dispose()
```

- uma nova chamada a `display()` cancela a apresentação anterior;
- `clear()` também cancela e limpa os objetos visuais;
- mudanças no tamanho do container são detectadas automaticamente com `ResizeObserver`;
- `wallPadding` define o recuo entre a borda visível e a área útil, em unidades do palco; o default é `0.25`;
- o cancelamento rejeita com `DisplayCancelledError` e código `DISPLAY_CANCELLED`;
- `dispose()` é idempotente e remove canvas, listener, loops e recursos do renderer;
- depois de `dispose()`, a instância não pode ser reutilizada.

Falhas de entrada continuam rejeitando normalmente. Falhas gráficas, de tema ou do runtime físico durante a apresentação são tratadas como best-effort: são registradas no console e a biblioteca ainda devolve uma cópia normalizada e congelada dos resultados resolvidos.

## Desempenho da v2

Comparando os artefatos Git da v1.0.6 com a v2.0.1:

| Métrica | v1.0.6 | v2.0.1 | Variação |
|---|---:|---:|---:|
| `dist` | 15.955.179 B | 7.817.051 B | −51,0% |
| pacote compactado | 4.396.834 B | 2.307.233 B | −47,5% |
| pacote descompactado | 16.098.720 B | 7.823.123 B | −51,4% |

O build impede que a distribuição ultrapasse 8 MiB e verifica que Havok não apareça no grafo cinemático inicial. A 2.0.2 adicionou o export estável do CSS e a documentação completa; a 2.0.3 tornou piso, barreiras, lançamentos e pousos responsivos ao canvas; a 2.0.4 passou a planejar a face durante todo o voo, recuperou o kick imediato da v1 dentro de limites estáveis, adicionou uma cauda seedada de energia/direção, packing sem sobreposição e colisões dado-dado desde a liberação, preserva respostas reais do Havok e congela o repouso físico sem atravessar pilhas. Os testes de trajetória medem a rotação acumulada do corpo, a viagem acumulada da normal da face, o afastamento da face resolvida no instante inicial e o resultado final após o contato.

## Desenvolvimento local

```bash
npm install
npm run typecheck
npm test
npm run build
```

O demo local está em `demo/` e permite alternar entre os dois renderers.

## Estado e próximos passos

A v2 está funcional e integrada ao frontend ERPG. Itens ainda planejados estão registrados no [devlog](DEVLOG_V2.md#próximos-passos), incluindo d3 nativo, testes visuais automatizados e redução adicional do chunk físico.

## Atribuição e licença

Este pacote ERPG deriva do projeto MIT `@3d-dice/dice-box`, da 3Ddice. A origem e as mudanças estruturais estão registradas em [FORK.md](FORK.md), e o aviso original é preservado em [LICENSE](LICENSE).

Licença MIT.
