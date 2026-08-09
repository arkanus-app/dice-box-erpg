# Desempenho do hot path físico

[← Voltar ao README](../README.md)

O benchmark físico usa Chromium com perfil Pixel 5 e desaceleração de CPU em
4×. Ele mede `d20` e `12d6` após um aquecimento, com cinco execuções por cenário:

```bash
npm run build:bundles
npm run benchmark:physics
```

Os resultados versionados estão em
[`physics-hot-path-baseline.json`](../benchmarks/physics-hot-path-baseline.json).
Além da duração observada por quem usa a biblioteca, a medição opt-in registra
frames, passos de Havok por resolução, chamadas e tempo do controlador, tempo de
render, colisões e custo da admissão de lançamentos.

Para inspecionar uma integração local, habilite a instrumentação antes de
apresentar os dados:

```ts
globalThis.__DICE3DVIEW_PHYSICS_PROFILE__ = true
```

Cada apresentação publica uma entrada `PerformanceMeasure` chamada
`dice3dview:physics-hot-path`; o snapshot está em `entry.detail`. Quando a flag
não está ativa, o chunk de profiling nem sequer é importado: o recorder não é
criado e esse caminho não mede relógio nem mantém contadores por frame.

## Alterações desta rodada

- índices diretos ligam `VisualEntry` e nome do node ao corpo ativo, removendo
  buscas lineares de reroll, suporte e colisão;
- quaternions, vetores de lock e objetos de entrada são reutilizados por corpo;
- seleção de timeout e conclusão usam uma passagem e contador, sem
  `filter()`, `sort()`, `some()`, `every()` ou `Set` temporários por frame;
- a resolução começa em 180 Hz para 2–24 dados ainda convergindo sem apoio,
  muda para 120 Hz após apoio físico real e usa 90 Hz quando sobra um único
  corpo; dados anexados por timeline reativam 180 Hz até o primeiro apoio.

Em `12d6`, comparando a resolução fixa após os ajustes estruturais com a política
adaptativa, os passos e chamadas de orientação caíram 18,72%, o tempo do
controlador caiu 18,17% e o tempo medido dentro de render caiu 8,24%. A mediana
da apresentação variou apenas 0,04%, porque os timings visuais e critérios de
acomodação foram deliberadamente preservados.

## Decisões orientadas pelo benchmark

O índice espacial de admissão não foi adicionado. Uma apresentação completa de
`12d6` executou somente 12 consultas e 66 comparações de pares; manter uma grade,
árvore ou hash espacial custaria mais estado e invalidações do que o trabalho
que substituiria no cenário auditado. A decisão deve ser revista com um cenário
de volume maior antes de implementar essa estrutura.

As próximas otimizações devem mirar alocações internas dos cálculos vetoriais
somente com um perfil de memória que demonstre pressão de GC. O benchmark atual
mostra que reduzir passos do solver produz um ganho mais claro e verificável.
