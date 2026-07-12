# Migração da v1 para a v2

[← Voltar ao README](../README.md)

A v2 é uma versão principal incompatível. Ela preserva o objetivo de exibir resultados resolvidos, mas substitui a fachada, os modos e a arquitetura herdada.

## Resumo das mudanças

| v1 | v2 |
|---|---|
| `DiceBox` / `WorldFacade` | `DiceResultViewer` |
| `displayRoll(request)` | `display(request)` |
| `updateConfig(options)` | `updateOptions(options)` |
| `forcedResultMode: "visual"` | sem equivalência 1:1; escolha o novo renderer pelo comportamento desejado |
| `forcedResultMode: "physics"` | `mode: "physics"` para preservar colisões e acomodação física |
| `hide()` / `show()` | controle o container pela aplicação |
| mundos onscreen/offscreen/none | um único ambiente visual |
| JavaScript sem tipos publicados | TypeScript estrito e `index.d.ts` |
| sem d2 | moeda d2 nativa |

Também foram removidos o worker OffscreenCanvas, infraestrutura/nomenclatura herdadas de “roll”, leitura da face como autoridade, `rollCollectionData`, builds paralelos minificado/não minificado e `@babylonjs/materials`.

## Antes

```ts
import DiceBox from '@erpg/dice3dview'

const diceBox = new DiceBox({
  container: '#dice-stage',
  assetPath: '/assets/dice-box/',
  forcedResultMode: 'physics'
})

await diceBox.init()

await diceBox.displayRoll({
  id: 'roll-1',
  dice: [
    { id: 'die-1', sides: 20, value: 17 }
  ]
})
```

## Depois

```ts
import { DiceResultViewer } from '@erpg/dice3dview'
import '@erpg/dice3dview/style.css'

const viewer = new DiceResultViewer({
  container: '#dice-stage',
  assetPath: '/assets/dice-box/',
  mode: 'physics'
})

await viewer.init()

await viewer.display({
  id: 'roll-1',
  dice: [
    { id: 'die-1', sides: 20, value: 17 }
  ]
})
```

## Passo a passo

### 1. Atualize a dependência

```json
{
  "dependencies": {
    "@erpg/dice3dview": "github:arkanus-app/dice-box-erpg#main"
  }
}
```

O pacote ainda não está no registry público do npm.

### 2. Atualize os assets

Substitua a pasta antiga pelo conteúdo de:

```text
node_modules/@erpg/dice3dview/dist/assets/dice-box/
```

Remova assets de Ammo/worker que não sejam usados por outras dependências. Confirme a presença de:

```text
assets/dice-box/havok/HavokPhysics.wasm
assets/dice-box/themes/default/theme.config.json
assets/dice-box/themes/default/default.json
```

### 3. Importe o CSS público

```ts
import '@erpg/dice3dview/style.css'
```

Na v2.0.2 o CSS possui um subpath estável. O container ainda precisa ter dimensões definidas pela aplicação.

### 4. Troque a classe e os métodos

- importe `DiceResultViewer`;
- troque `displayRoll()` por `display()`;
- troque `updateConfig()` por `updateOptions()`;
- chame `dispose()` no cleanup do componente.

### 5. Migre o modo

Não existe equivalência direta entre `forcedResultMode: "visual"` e `mode: "kinematic"`. Na v1, `visual` ainda fazia parte do pipeline físico e mudava apenas a estratégia de correção final.

Na v2, escolha pelo comportamento:

```ts
// apresentação leve, dirigida e sem colisões
mode: 'kinematic'

// lançamento, gravidade, colisões e acomodação Havok
mode: 'physics'
```

`kinematic` agora é o padrão. Havok é carregado quando o renderer físico é inicializado.

### 6. Garanta um ID de request

`request.id` é obrigatório e não pode estar vazio. Ele também vira o `seed` visual quando `seed` não é fornecido.

```ts
const id = crypto.randomUUID()

await viewer.display({
  id,
  seed: id,
  dice: resolvedDice
})
```

### 7. Passe somente resultados resolvidos

Toda fórmula deve ser resolvida antes da apresentação:

```ts
const roll = rollRpgDice('2d20kh1 + 5')

await viewer.display({
  id: crypto.randomUUID(),
  dice: roll.dice
    .filter(die => typeof die.sides === 'number' && die.sides === 20)
    .map(die => ({
      id: die.id,
      sides: 20,
      value: die.value,
      discarded: !die.useInTotal
    }))
})
```

O viewer nunca deve receber a fórmula para interpretá-la.

### 8. Trate cancelamento

```ts
import { isDisplayCancelledError } from '@erpg/dice3dview'

void viewer.display(request).catch(error => {
  if(isDisplayCancelledError(error)) return
  console.error(error)
})
```

Iniciar uma nova apresentação ou chamar `clear()` cancela a anterior.

### 9. Revise `maxDice`

O default passou de 999 para 120 corpos visuais. Um d100 conta como dois. Para apresentações maiores:

```ts
const viewer = new DiceResultViewer({
  container: '#dice-stage',
  maxDice: 240,
  enableShadows: false
})
```

Avalie memória e FPS antes de elevar o limite.

### 10. Migre d2 e d3

d2 agora deve ser enviado diretamente:

```ts
{ id: 'coin', sides: 2, value: 1 }
```

d3 ainda não é suportado nativamente. Uma adaptação temporária pode usar d6:

```ts
const displayDie = die.sides === 3
  ? { ...die, sides: 6 as const, value: Math.min(3, die.value) }
  : die
```

Essa conversão pertence à aplicação, não à biblioteca visual.

## Mudanças no retorno

`display()` devolve:

```ts
interface DisplayResult {
  id: string
  dice: readonly ResolvedDie[]
  durationMs: number
}
```

O array e seus objetos são cópias normalizadas e congeladas. A garantia é de igualdade dos valores resolvidos, não de identidade dos objetos.

## Opções herdadas sem efeito

`wallPadding`, `spawnSpacing` e `spawnHeightStep` continuam tipadas para facilitar a migração, mas não alteram o renderer atual. Temas podem conter `extends` e `specularPower`, que também não têm efeito na 2.0.2.

Não baseie um novo código nessas opções.

## Checklist final

- [ ] dependência aponta para a v2;
- [ ] assets novos foram copiados;
- [ ] CSS público foi importado;
- [ ] `DiceResultViewer` substituiu a fachada antiga;
- [ ] `display()` substituiu `displayRoll()`;
- [ ] `mode` substituiu `forcedResultMode`;
- [ ] todo request possui ID;
- [ ] somente valores resolvidos são enviados;
- [ ] cancelamentos são ignorados de forma tipada;
- [ ] d2 não é mais filtrado no frontend;
- [ ] d3 recebe adaptação externa, se necessário;
- [ ] cleanup chama `dispose()`;
- [ ] fluxo foi testado nos dois modos.
