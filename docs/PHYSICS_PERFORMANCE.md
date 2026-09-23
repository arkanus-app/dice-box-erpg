# Desempenho da física

[← Voltar ao README](../README.md)

Na v3 a trajetória inteira é calculada antes da reprodução. O custo que importa
é o tempo de CPU desse cálculo: depois dele, cada quadro apenas interpola poses
gravadas. O renderizador executa o cálculo em fatias de 8 ms, então mesmo lances
grandes não bloqueiam a página.

```bash
npm run benchmark:physics             # 30 execuções por cenário
npm run benchmark:physics -- 20 --write
```

O script usa o mesmo pipeline do renderizador (plano de lançamento da v2,
simulação, re-amostragem) com o modelo padrão e grava
[`physics-baseline.json`](../benchmarks/physics-baseline.json). O baseline da v2,
medido com Havok em Chromium com perfil Pixel 5, foi preservado em
[`physics-hot-path-baseline-v2.json`](../benchmarks/physics-hot-path-baseline-v2.json).

## Resultado da 3.0.0-alpha.0

Node 24, Windows x64, sem limitação de CPU, 20 execuções por cenário:

| Cenário | CPU mediana | CPU p95 | Apresentação (mediana) | Impactos entre dados | Tentativas |
|---|---:|---:|---:|---:|---:|
| d20 | 1,3 ms | 9,9 ms | 2,1 s | 0 | 1,00 |
| 4d6 | 3,5 ms | 17,0 ms | 1,9 s | 4,4 | 1,00 |
| d4–d20 | 7,3 ms | 28,3 ms | 2,2 s | 8,2 | 1,10 |
| 8d10 | 10,8 ms | 27,3 ms | 2,3 s | 12,9 | 1,05 |
| 12d6 | 13,1 ms | 32,1 ms | 2,1 s | 27,4 | 1,10 |
| 24d6 | 31,6 ms | 67,9 ms | 3,0 s | 82,2 | 1,15 |
| 60d6 | 94,1 ms | 179,8 ms | 6,9 s | 359,6 | 1,00 |
| 120d6 | 506,8 ms | 663,3 ms | 11,9 s | 1.307,8 | 1,00 |

A comparação com a v2 (download, compilação e física) está em
[Benchmarks: v2 × v3](BENCHMARKS.md).

Estes números ainda não foram medidos em aparelhos; como referência, CPUs
móveis costumam ser de 3× a 5× mais lentas. Até cerca de 24 dados o cálculo
cabe em poucos quadros; acima disso ele é fatiado e o arremesso começa assim
que termina. A duração da apresentação de lances grandes vem das
waves de entrada da coreografia da v2 (6 a 8 dados por wave).

## O que torna o cálculo barato

- o laço não aloca: estado escalar por corpo, buffers de geometria
  pré-alocados e contatos em pool;
- broadphase por varredura ordenada em x: só pares que podem se tocar no passo
  chegam ao teste de eixos separadores;
- repouso medido por deslocamento numa janela de tempo, imune ao tremor típico
  de pilhas, e amortecimento de repouso para corpos lentos em contato;
- a simulação termina quando todos os corpos dormem, sem tempo fixo: o
  `settleTimeout` é um orçamento, não um corte. Passado o orçamento, um dado
  ainda em movimento perde energia aos poucos (como um feltro mais áspero) até
  repousar, e cada filho de explosão ganha o próprio orçamento a partir do
  nascimento, então cadeias longas de explosões terminam inteiras;
- mesas com mais de 16 corpos aceitam alguns dados apoiados em outros em vez de
  recalcular; acima de 40, o passo é mais grosso e dados parados passam a
  sustentar os seguintes sem voltar a ser simulados;
- rerolagens e explosões tardias simulam apenas os dados em movimento: os
  demais são obstáculos fixos.

## Qualidade verificada pelos testes

`npm test` inclui, entre outros:

- face pedida para cima em 104 lançamentos de d4 a d100;
- penetração transitória entre dados abaixo de 25% do raio em 12d6;
- quadros idênticos para a mesma `seed` e cálculo fatiado idêntico ao síncrono;
- filhos de explosão liberados somente depois que o pai estabiliza;
- 48d6 mostrando todos os valores;
- rerolagem física (`hop`, `spin`, `edge`) sem mover os outros dados, partindo
  da pose de repouso, e explosão tardia a partir de um pai em repouso.
