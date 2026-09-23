# Migração da v2 para a v3

[← Voltar ao README](../README.md)

A v3 mantém a API pública da v2: `DiceResultViewer`, `display()`,
`displayTimeline()`, `createMixedDisplayRequest()`, `createSystemDisplayRequest()`,
os eventos da timeline, `onTimelineProgress`, `onCollision`, os temas e os
formatos de request e resultado. A maioria das integrações atualiza a versão,
remove a pasta `havok/` dos assets e continua funcionando.

## Checklist

1. Atualize a dependência para `@erpg/dice3dview@^3`.
2. Remova `assets/dice-box/havok/` do que a aplicação publica; ela não é mais lida.
3. Se você usava `@erpg/dice3dview/external`, pode manter o import ou trocar
   para `@erpg/dice3dview`: os dois apontam para o mesmo módulo. Babylon.js e
   Havok podem sair das dependências da aplicação se estavam lá só por causa
   desta biblioteca.
4. Remova `mode: 'kinematic'` quando for conveniente (continua aceito, veja abaixo).
5. Revise ajustes finos de física (`gravity`, `throwForce`, `friction` etc.):
   os defaults foram recalibrados para o motor novo.

## Mudanças de comportamento

### Só existe o modo físico

O renderer cinemático foi removido. Toda apresentação é simulada.

- `mode: 'kinematic'` em `ViewerOptions`, `DisplayRequest`,
  `DisplayTimelineRequest` e nos adaptadores de sistema continua compilando e
  sendo aceito em runtime; é apresentado com física e gera um aviso único no
  console. Outros valores continuam sendo rejeitados.
- `DisplayMode` agora é `'physics'`. O tipo dos campos `mode` aceita também o
  literal legado `'kinematic'`, marcado como `@deprecated`.
- `duration` (duração do arco cinemático) é aceita e ignorada. Para mudar o
  ritmo, use `throwForce`, `gravity` e `settleTimeout`.
- Rolagens de mais de 40 corpos, que antes ficavam a critério do modo escolhido,
  agora são sempre físicas: a coreografia usa as waves da v2, com espaçamento
  pela velocidade real de lançamento, e aceita pilhas.

### Timeline

- Explosões tardias e rerolagens (`reroll`, `unique`) são físicas: o dado é
  relançado a partir de onde está (`hop`, `spin`) ou volta pela borda (`edge`),
  e os outros dados ficam imóveis. Na v2 elas eram roteirizadas em ambos os modos.
- Os badges de `compound` (`Σ n`) e `penetrate` (`−n`) foram removidos: o dado
  pulsa na cor do efeito. `showBadge` é aceito e ignorado.
- Os efeitos de destaque (HighlightLayer da v2) viraram um contorno de brilho e
  um tom na superfície, mais contidos, que não apagam o número da face.
- Dados descartados (keep/drop, absorção do compound e `discarded: true` no
  `display()`) perdem a saturação e continuam opacos. Na v2, a timeline os
  deixava translúcidos e o `display()` usava um material cinza. Em keep/drop,
  os dados que sobraram respondem com um brilho suave. A duração padrão de
  `keep` e `drop` passou de 200 para 450 ms.
- Novos elementos de transição: anel de choque no chão em explosões,
  rerolagens e críticos; antecipação (brilho e tremor) antes de uma rerolagem
  ou explosão tardia; filhos de explosão saindo de dentro do pai; e fade dos
  dados anteriores quando uma nova apresentação começa (na v2 eles sumiam de
  uma vez).

### Física e resultado

- O valor continua vindo do chamador. A v2 guiava o dado até a face pedida com
  preflight, torque e lock; a v3 deixa o dado correr livre e aplica ao desenho
  uma rotação de simetria do poliedro, invisível na silhueta (veja
  [Motor físico da v3](API.md#motor-físico-da-v3)).
- A mesma `seed` agora produz exatamente a mesma animação em qualquer navegador.
  Na v2 isso só valia para o modo cinemático.
- `onCollision` é emitido para impactos entre dados, uma vez por par e episódio,
  com `force` igual à velocidade de aproximação vezes a menor massa.
- Em temas sem orientação de glifos publicada, o número fica no giro natural do
  arremesso, como na v2. Temas com `faceAtlas.orientation` mostram o glifo em pé.

### Renderização

- WebGL próprio (WebGL2 com fallback para WebGL1) no lugar de Babylon.js. Os
  materiais da v2 foram reproduzidos: cor com máscara de textura, `standard`,
  bump, specular, moedas com arte ou cor do tema.
- Sombras são sombras de contato suaves sob cada dado. `shadowResolution` é
  aceita e ignorada; `enableShadows` e `shadowTransparency` continuam valendo.
- `antialias` continua sendo lido na construção.

## Opções descontinuadas

| Opção | Situação na v3 |
|---|---|
| `mode: 'kinematic'` | aceita; apresentada com física e avisada uma vez |
| `duration` | aceita e ignorada |
| `physicsWasmUrl` | aceita e ignorada (sem WebAssembly) |
| `shadowResolution` | aceita e ignorada (sem shadow map) |
| `timeline.effects.compound.showBadge`, `timeline.effects.penetrate.showBadge` | aceitas e ignoradas |
| `wallBounceChance` | continua como alias deprecated de `aggressiveThrowChance` |

## Temas

Os temas da v2 funcionam sem alteração. Novidades opcionais:

- `faceAtlas.orientation`: arquivo com a direção de leitura de cada glifo, usado
  para apresentar símbolos em pé. Os temas simbólicos incluídos (Vampiro V5,
  Assimilação, Fate) já trazem `glyph-orientation.json`.
- `npm run themes:align` alinha os glifos de atlas SVG simbólicos às faces do
  modelo padrão e gera o arquivo de orientação. Os atlas incluídos foram
  realinhados: as cruzes do V5 e os símbolos de Assimilação e Fate ficam
  centralizados e retos em cada face.

## Remoções internas

Chunks lazy de física, sombras, profiling e highlight, o runtime Havok, o
profiler `__DICE3DVIEW_PHYSICS_PROFILE__` e a entrada `PerformanceMeasure`
`dice3dview:physics-hot-path` deixaram de existir. O custo da física é medido
por `npm run benchmark:physics` (veja [Desempenho da física](PHYSICS_PERFORMANCE.md)).
