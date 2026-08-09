# Dados simbólicos: Vampiro V5, Assimilação e Fate

[← Voltar ao README](../README.md)

Esta integração mantém duas responsabilidades separadas:

1. `@erpg/dicecore` sorteia os valores e aplica as regras;
2. `@erpg/dice3dview` recebe cada valor pronto, escolhe um tema pelo `profileId` e orienta a face numérica correspondente.

O símbolo é apresentação. O número continua sendo a autoridade para replay, auditoria e física.

## Perfis disponíveis

| `profileId` | Tema 3D | Dado |
|---|---|---:|
| `vampire-v5-normal-d10` | `vampire-v5-normal` | d10 |
| `vampire-v5-hunger-d10` | `vampire-v5-hunger` | d10 |
| `assimilation-d6` | `assimilation` | d6 |
| `assimilation-d10` | `assimilation` | d10 |
| `assimilation-d12` | `assimilation` | d12 |
| `fate-df` | `fate` | d6 |
| `daggerheart-hope-d12` | `default-v2` | d12 |
| `daggerheart-fear-d12` | `default-v2` | d12 |

Os três perfis de Assimilação compartilham um atlas, mas validam lados diferentes.
O perfil Fate usa um d6 físico: `value` permanece entre 1 e 6 para orientar a malha, enquanto `fateValue` no resultado do core informa −1, 0 ou +1.

## Uso com `@erpg/dicecore`

Vampiro V5:

```ts
import { rollVampireV5 } from '@erpg/dicecore'
import {
  DiceResultViewer,
  createSystemDisplayRequest
} from '@erpg/dice3dview'

const roll = rollVampireV5(
  { pool: 7, hunger: 3, difficulty: 4 },
  { seed: 'sessao-42' }
)

await viewer.display(createSystemDisplayRequest({
  id: 'v5-42',
  seed: 'v5-42',
  dice: roll.dice
}))
```

Assimilação preserva a escolha do jogador:

```ts
import {
  evaluateAssimilationSelection,
  rollAssimilation
} from '@erpg/dicecore'
import { createSystemDisplayRequest } from '@erpg/dice3dview'

const roll = rollAssimilation(
  { d6: 2, d10: 1, d12: 1, keep: 1 },
  { seed: 'sessao-42' }
)

// A UI escolhe; o core não classifica automaticamente o "melhor" resultado.
const selection = evaluateAssimilationSelection(roll, [roll.dice[2].id])

await viewer.display(createSystemDisplayRequest({
  id: 'assimilation-42',
  dice: roll.dice,
  keptIds: selection.selectedIds
}))
```

`keptIds` aceita tanto `SystemDieResult.id` quanto `sourceDieId`. Os demais dados recebem `discarded: true` apenas para apresentação.

Fate usa quatro dados por padrão:

```ts
import { rollFateDice } from '@erpg/dicecore'
import { createSystemDisplayRequest } from '@erpg/dice3dview'

const roll = rollFateDice(undefined, { seed: 'sessao-42' })

await viewer.display(createSystemDisplayRequest({
  id: 'fate-42',
  seed: 'fate-42',
  dice: roll.dice
}))

console.log(roll.total) // soma de quatro fateValue, entre −4 e +4
```

### Misturando sistemas e dados genéricos

```ts
import { rollMixedDice } from '@erpg/dicecore'
import { createMixedDisplayRequest } from '@erpg/dice3dview'

const mixed = rollMixedDice(
  '2d20+5; v5(7,3,4); fate(4); assim(2,1,1,1); daggerheart(modifier=2,difficulty=15)',
  { seed: 'sessao-42' }
)

await viewer.display(createMixedDisplayRequest({
  id: 'mixed-42',
  seed: 'mixed-42',
  dice: mixed.dice
}))
```

O `;` significa “role junto”, sem somar grandezas incompatíveis. A camada 2D
usa `mixed.rolls`, `mixed.dice` e `mixed.output`; a camada 3D usa a mesma lista
achatada em `createMixedDisplayRequest()`. `physicalValue` escolhe a face
visível e `profileId` escolhe o atlas simbólico.

## Mapeamento das faces

### Vampiro: A Máscara 5ª Edição

| Valor | Dado normal | Dado de Fome |
|---:|---|---|
| 1 | Vazio | Gatilho bestial |
| 2–5 | Vazio | Vazio |
| 6–9 | Sucesso | Sucesso |
| 10 | Sucesso + crítico | Sucesso + gatilho de crítico descontrolado |

O core conta um sucesso em cada 6–10 e acrescenta dois sucessos por par de resultados 10. O resultado 10 em dado de Fome só torna o crítico descontrolado quando o teste alcança a dificuldade; o resultado 1 em Fome só torna a falha bestial quando o teste falha.

### Assimilação

O kit atual da New Order associa Joaninha a Sucesso, Cervo a Adaptação e Coruja a Pressão. Para não redistribuir ilustrações sem licença, o tema incluído usa equivalentes próprios: marca circular, ramificação e triângulo de alerta. A semântica e as quantidades são as mesmas.

| Valor | Símbolos |
|---:|---|
| 1–2 | Vazio |
| 3–4 | Pressão |
| 5 | Adaptação + Pressão |
| 6 | Sucesso |
| 7 | 2 Sucessos |
| 8 | Sucesso + Adaptação |
| 9 | Sucesso + Adaptação + Pressão |
| 10 | 2 Sucessos + Pressão |
| 11 | Sucesso + 2 Adaptações + Pressão |
| 12 | 2 Pressões |

O d6 usa as linhas 1–6; o d10, 1–10; o d12, 1–12. Esta tabela acompanha o rolador web publicado em 31 de julho de 2026. Se a editora alterar a edição vigente, atualize primeiro o mapa em `rpg-dice-roller/src/v3/systems/assimilation.ts`, depois `faceMetadata.dice` no tema e, por fim, os dois atlas SVG.

### Daggerheart

Daggerheart usa dois d12 numericos distintos: Esperanca e Medo. O viewer
mantem ambos como d12 `default-v2`; o perfil estabelece qual resultado deve
receber a cor da skin e qual deve receber sua inversa RGB. O core soma as duas
faces e o modificador, usa a Dificuldade opcional para sucesso/falha e trata
faces iguais como sucesso critico.

| `profileId` | Papel | Cor padrao |
|---|---|---|
| `daggerheart-hope-d12` | Esperanca | `#ff0a7a` |
| `daggerheart-fear-d12` | Medo | `#00f585` |

### Fate/Fudge

Cada Fate Die é um d6 com duas faces negativas, duas vazias e duas positivas:

| Face física | Símbolo | `fateValue` |
|---:|---|---:|
| 1–2 | − | −1 |
| 3–4 | Vazia | 0 |
| 5–6 | + | +1 |

A rolagem padrão soma quatro dados e produz um resultado de −4 a +4. O core usa `rpg-dice-roller/src/v3/systems/fate.ts` para manter juntas a face física, a interpretação semântica e a trilha de replay. No viewer, altere `faceMetadata.dice.d6` e os atlas do tema Fate caso queira mudar qual face física recebe cada símbolo; mantenha duas ocorrências de cada resultado para conservar a distribuição oficial.

## Quais arquivos editar

Cada tema possui três arquivos que devem permanecer sincronizados:

```text
public/assets/dice-box/themes/
├── vampire-v5-normal/
│   ├── theme.config.json
│   ├── faces-light.svg
│   └── faces-dark.svg
├── vampire-v5-hunger/
│   └── ...
├── assimilation/
│   └── ...
└── fate/
	├── faces-light.svg
	└── faces-dark.svg
```

`theme.config.json` descreve as faces semanticamente. `faces-light.svg` e
`faces-dark.svg` são os atlas vetoriais realmente aplicados à malha 3D. O valor
numérico continua escolhendo a ilha UV e o atlas troca somente o desenho visível.

Os glifos fornecidos para Vampiro V5 e Assimilação ficam em:

```text
scripts/theme-artwork/
├── vampire-v5-success.svg
├── vampire-v5-critical.svg
├── vampire-v5-hunger-failure.svg
├── vampire-v5-hunger-critical.svg
├── assimilation-success-ladybug.svg
├── assimilation-adaptation-deer.svg
└── assimilation-pressure-owl.svg
```

Para mudar uma face:

1. altere a regra correspondente no `rpg-dice-roller`, quando a semântica também
   mudar;
2. edite `faceMetadata.dice` no `theme.config.json` do tema;
3. para Vampiro, atualize os SVGs em `scripts/theme-artwork/` e execute
   `npm run themes:generate:vampire`;
4. para outros temas, localize no atlas o grupo `<use>` da mesma face física e
   troque o glifo, preservando posição, dimensão e ilha UV;
5. mantenha os paths de origem sincronizados com os símbolos incorporados aos
   atlas claro e escuro.

O layout `erpg-default-v1` vem de
`public/assets/dice-box/themes/default/default.json`. Não mova uma arte para a
ilha de outro valor: a física continuará resolvendo o número original e o dado
parecerá mostrar um resultado incorreto.

Depois execute:

```bash
npm run themes:generate:vampire
npm run themes:check
npm test
npm run build
```

`themes:check` valida os atlas, os metadados, a tabela de Assimilação, a
distribuição Fate e os perfis de Vampiro antes do build.

## Proveniência e redistribuição dos glifos

Os temas ativos de Vampiro e Assimilação usam SVGs fornecidos pelo responsável
do projeto. Os sinais geométricos “+” e “−” do tema Fate são vetores incorporados
aos atlas. Confirme os direitos de redistribuição de toda arte fornecida antes de
publicar o pacote em npm/CDN.

Para substituir ou distribuir outro conjunto de arte:

1. obtenha SVGs originais e autorização de redistribuição em npm/CDN;
2. adicione os SVGs em `scripts/theme-artwork/` e mapeie-os em `glyphSources`;
3. configure um `viewBox` com margem segura, ou ajuste `iconPlacements`;
4. atualize `artwork` em cada `theme.config.json` com autoria e licença;
5. regenere e inspecione todas as faces.

Também é possível manter o tema oficial fora do pacote:

```ts
const viewer = new DiceResultViewer({
  container: '#dice-stage',
  externalThemes: {
    'assimilation-official': 'https://cdn.example.com/assimilation'
  }
})
```

Nesse caso, mude o `theme` retornado pelo adaptador na aplicação ou construa os `ResolvedDie` diretamente.

## O que não editar

Para trocar apenas números por símbolos, não altere:

- `colliderFaceMap`;
- as malhas `d6`, `d10`, `d12` ou seus colliders;
- a lógica de orientação em `src/renderers/PolyhedralFactory.ts`.

Esses elementos associam o valor numérico à face física correta. Alterá-los pode fazer o dado pousar mostrando outro resultado.

Os temas simbólicos também não usam `default/normal.webp`: esse mapa normal
contém números em relevo. Se quiser relevo nos símbolos, crie um novo normal
map a partir do mesmo atlas simbólico. Os temas texturizados usam material
`standard`, portanto sua cor vem do atlas; `themeColor` continua sendo usado
pelos perfis e pela emissão, mas não recolore a superfície diffuse.

## Metadados e acessibilidade

Cada `theme.config.json` inclui:

- `faceAtlas.layoutId`: compatibilidade com o layout UV `erpg-default-v1`;
- `faceMetadata.mappingId`: versão semântica do mapa;
- `faceMetadata.symbols`: nomes legíveis;
- `faceMetadata.dice`: símbolos de cada valor.

Esses metadados não mudam a rolagem. Eles podem alimentar legenda, texto alternativo e testes de consistência.

## Fontes de regras consultadas

- [Rolador publicado de Assimilação](https://assimilacaorpg.com.br/rolador/app)
- [Kit de dados de Assimilação — New Order Editora](https://newordereditora.com/loja/rpg/assimilacao-rpg/kit-de-dados-3-dados-assimilacao-rpg/)
- [Conjunto oficial de dados de Vampiro V5 — Renegade Game Studios](https://renegadegamestudios.com/vampire-the-masquerade-5th-edition-dice-set/)
- [Fate Core SRD — o que é necessário para jogar](https://fate-srd.com/fate-core/what-you-need-play)
- [Fate Core SRD — dados e escala](https://fate-srd.com/fate-core/taking-action-dice-ladder)

As marcas pertencem aos respectivos titulares. Os temas deste pacote são implementações de compatibilidade não oficiais.
