# @erpg/dice3dview

Camada TypeScript de apresentação 3D para resultados de dados já resolvidos.

O `@erpg/dicecore` interpreta a fórmula e decide os resultados; o `@erpg/dice3dview` recebe esses valores prontos e apenas os apresenta. A biblioteca não interpreta notação, não sorteia valores e não usa a face física como fonte do resultado.

Versão atual: **2.0.2**.

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
- modo físico lazy com colisões, perfis pré-calculados por geometria e aterrissagem na face solicitada;
- no modo cinemático, lançamentos laterais, posições finais dispersas e trajetória determinística por `seed`;
- cancelamento tipado, cache de temas/modelos/materiais e pools de meshes;
- um entrypoint ESM com chunks lazy, CSS público e tipos TypeScript;
- orçamento automatizado de até 8 MiB para toda a distribuição.

## Instalação

O pacote é distribuído atualmente pela `main` do GitHub:

```bash
npm install github:arkanus-app/dice-box-erpg#main
```

`#main` é o canal móvel. Para builds reproduzíveis, prefira a tag da release:

```bash
npm install github:arkanus-app/dice-box-erpg#v2.0.2
```

Em `package.json`:

```json
{
  "dependencies": {
    "@erpg/dice3dview": "github:arkanus-app/dice-box-erpg#main"
  }
}
```

O nome ainda não está publicado no registry público do npm. Portanto, `npm install @erpg/dice3dview` sozinho não é uma instrução válida neste momento.

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
      discarded: !die.useInTotal
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
| Trajetória | arco dirigido | lançamento lateral, gravidade e paredes |
| Face final | interpolação determinística | acomodação guiada e commit físico exato |
| Uso indicado | overlays e alto volume | rolagens com sensação física |

No modo físico, cada formato possui parâmetros pré-calculados de massa, tempo de acomodação, força angular e velocidade máxima. O fluxo interno é:

```text
freeFall → guidedSettle → finalLock → commit → complete
```

A orientação é corrigida no corpo Havok. A apresentação só termina depois de a face resolvida ser sincronizada em um subpasso físico real; o valor não é lido de volta da cena.

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

O build impede que a distribuição ultrapasse 8 MiB e verifica que Havok não apareça no grafo cinemático inicial. A 2.0.2 adiciona o export estável do CSS, o tipo público de material, validação automática dos documentos e esta nova documentação.

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
