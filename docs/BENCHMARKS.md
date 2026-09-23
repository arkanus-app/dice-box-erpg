# Benchmarks: v2 × v3

[← Voltar ao README](../README.md)

Comparação entre a v2.6.0 (Babylon.js + Havok) e a v3 (renderizador WebGL e
motor de física próprios). Todos os números abaixo têm o ambiente anotado:
números de máquinas ou navegadores diferentes não são comparados entre si.

## Como reproduzir

```bash
npm run build                  # dist/ da v3
npm run benchmark:compare      # extrai a v2.6.0 do git e mede bytes e compilação
npm run benchmark:physics      # CPU da física da v3 por cenário
npm run benchmark:browser      # servidor estático para a comparação no navegador
```

`benchmark:compare` extrai o `dist/` versionado na tag `v2.6.0` para
`benchmarks/compare/v2/` (ignorado pelo git) e grava
[`v2-v3-comparison.json`](../benchmarks/v2-v3-comparison.json).
`benchmark:browser` serve o repositório em `http://localhost:5182/`; abra
`/benchmarks/compare/` e clique em **Rodar comparação**: v3, v2 física e v2
cinemática rodam, uma de cada vez, num iframe novo, com os mesmos cenários,
valores e tamanho de palco.

## Download e compilação

Node 24.18 (V8 13.6), Windows x64, mediana de 7 processos novos por medição.
"Compilação" é o tempo do V8 para compilar os módulos da primeira carga
(`vm.SourceTextModule`); o WASM é compilado com `WebAssembly.compile`.

| Primeira carga | Arquivos | Raw | Gzip | Brotli | Compilação JS | Compilação WASM |
|---|---:|---:|---:|---:|---:|---:|
| v2 cinemático | 2 | 2.120.423 B | 438.335 B | 328.781 B | 29 ms | — |
| v2 físico (+ Havok JS e WASM) | 5 | 4.481.022 B | 1.158.986 B | 879.619 B | 34 ms | 5,6 ms |
| **v3** (física incluída) | 1 | 127.656 B | **43.608 B** | 38.022 B | **6,8 ms** | — |
| v3 com partículas e presets | 3 | 157.537 B | 51.494 B | 44.927 B | 8,3 ms | — |

- A v3 baixa **26,6× menos** que a v2 no modo físico e **10,1× menos** que a
  v2 só cinemática, com física de verdade incluída.
- O V8 compila a primeira carga da v3 **5× mais rápido** que a da v2 física.
- A v2 física faz duas viagens a mais antes do primeiro arremesso (chunk do
  renderer físico e o WASM de 2 MB); na v3 tudo está no mesmo módulo.

## CPU da física

**v3**, Node 24.18, Windows x64, sem limitação de CPU, 20 execuções por
cenário ([`physics-baseline.json`](../benchmarks/physics-baseline.json)). A
trajetória inteira é calculada uma vez, em fatias de 8 ms; depois cada quadro só
interpola poses.

| Cenário | CPU mediana | CPU p95 | Duração da animação |
|---|---:|---:|---:|
| d20 | 1,3 ms | 9,9 ms | 2,1 s |
| 4d6 | 3,5 ms | 17,0 ms | 1,9 s |
| d4–d20 | 7,3 ms | 28,3 ms | 2,2 s |
| 12d6 | 13,1 ms | 32,1 ms | 2,1 s |
| 24d6 | 31,6 ms | 67,9 ms | 3,0 s |
| 60d6 | 94,1 ms | 179,8 ms | 6,9 s |
| 120d6 | 506,8 ms | 663,3 ms | 11,9 s |

**v2**, medida em agosto de 2026 com Playwright Chromium emulando um Pixel 5
com CPU 4× mais lenta
([`physics-hot-path-baseline-v2.json`](../benchmarks/physics-hot-path-baseline-v2.json)).
Na v2 o Havok roda a cada quadro, junto com a guia que leva o dado à face pedida:

| Cenário | Guia de física por apresentação | Render por apresentação | Duração |
|---|---:|---:|---:|
| d20 | 66,7 ms | 456,3 ms | 2,7 s |
| 12d6 | 294,3 ms | 1.409,4 ms | 5,9 s |

Os ambientes são diferentes, então a comparação é só de ordem de grandeza: com
a CPU 4× mais lenta, a física inteira de um 12d6 da v3 ficaria em torno de
50 ms, contra ~294 ms só de guia (fora o passo do Havok) na v2.

## No navegador

A página `benchmarks/compare/` mede, no mesmo navegador e máquina: import do
módulo, `init()`, primeira rolagem a frio (inclui tema e, na v2 física, o
Havok), duração de cada cenário, ritmo de quadros (médio, p95, pior e quadros
acima de 25 ms), tarefas longas do main thread e heap JS ao final.

Na sessão em que esta página foi criada, a rodada da v3 terminou (import
12,1 ms, `init()` 47 ms, primeira rolagem d20 a frio 2,1 s de animação) e a
rodada da v2 foi interrompida. Rode `npm run benchmark:browser` para a tabela
completa na sua máquina.
