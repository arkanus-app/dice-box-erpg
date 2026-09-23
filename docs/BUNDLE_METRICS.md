# Métricas de bundle e carregamento

[← Voltar ao README](../README.md)

A v3 é um único módulo ES sem dependências de runtime: renderizador WebGL,
motor de física, timeline, skins, temas e adaptadores. O motor de partículas e
seus presets são o único chunk à parte, importado dinamicamente só quando a
opção `particles` é usada. Os números versionados estão em
[`bundle-baseline.json`](../benchmarks/bundle-baseline.json); os da v2 foram
preservados em [`bundle-baseline-v2.json`](../benchmarks/bundle-baseline-v2.json)
para comparação.

## Como medir

```bash
npm run build:bundles
npm run bundle:metrics            # imprime
node scripts/bundle-metrics.mjs --write
npm run bundle:check
```

`bundle:metrics` informa bytes raw, gzip (nível 9) e Brotli e a quantidade de
arquivos para a biblioteca, o entrypoint `adapters`, os assets, `dist` e o
pacote npm (`npm pack --dry-run`).

`bundle:check` valida a topologia e os orçamentos:

- a biblioteca é um único módulo; o único chunk é o de partículas, carregado por `import()` e fora do grafo estático;
- nenhum JavaScript referencia Babylon, Havok ou `.wasm`, e `dist` não contém WebAssembly;
- `package.json` não declara dependências de runtime e todos os exports existem;
- `adapters` não contém código de renderização;
- biblioteca até 45 KB gzip, motor de partículas até 6 KB, presets até 5 KB e `adapters` até 3 KB gzip;
- o motor de partículas não importa os presets estaticamente: um efeito dado como definição completa (um visual da oficina) não baixa os presets.

O build compacta a saída: o Vite mantém os espaços em builds ES de biblioteca
(por causa das anotações `/* @__PURE__ */`), mas a biblioteca é um único módulo
sem tree-shaking a preservar, então `vite.config.ts` remove espaços dos chunks
finais e comentários/indentação dos shaders GLSL. O shader de partículas viaja
com o chunk de partículas e só é compilado no primeiro efeito.

## Resultado da 3.0.0-alpha.0

| Artefato | Arquivos | Raw | Gzip | Brotli |
|---|---:|---:|---:|---:|
| biblioteca (`dice3dview.es.js`) | 1 | 127.656 B | 43.608 B | 38.022 B |
| motor de partículas (sob demanda) | 1 | 10.945 B | 4.328 B | 3.868 B |
| 15 presets de partículas (sob demanda) | 1 | 18.936 B | 3.558 B | 3.037 B |
| `adapters` | 1 | 4.416 B | 1.494 B | 1.354 B |
| assets (temas, modelos, atlas) | 25 | 401.020 B | 196.250 B | 182.059 B |

O pacote npm tem 52 arquivos: 332.309 B compactado e 826.489 B descompactado
(a v2.6.0 tinha 125 arquivos, 1.612.802 B e 5.979.069 B).

## Comparação com a v2

| Primeira carga | v2 | v3 | Redução |
|---|---:|---:|---:|
| modo físico (Babylon + Havok JS + WASM), gzip | 1.158.986 B | 43.608 B | 26,6× |
| modo físico, Brotli | 879.619 B | 38.022 B | 23,1× |
| só o modo cinemático da v2, gzip | 438.335 B | 43.608 B | 10,1× |

Compilação e CPU estão em [Benchmarks: v2 × v3](BENCHMARKS.md).

Na v2, o modo físico ainda baixava o `HavokPhysics.wasm` (2.094.566 B raw) por
URL e compilava WebAssembly antes do primeiro arremesso. Na v3 a física faz
parte do mesmo módulo: não há segunda requisição nem compilação de WASM antes do
primeiro dado aparecer.

## Interpretação

A comparação usa a v2 no mesmo formato de medição (gzip nível 9 e Brotli dos
arquivos que o navegador realmente baixa na primeira apresentação). O tamanho de
`dist` inclui assets compartilhados e não representa bytes transferidos por uma
aplicação: os temas são carregados sob demanda, um por vez.

Registre execuções frias e quentes, bytes transferidos, requests e tempos de
import, `init()` e primeira apresentação no mesmo ambiente quando comparar
integrações; números coletados com hardware, cache ou compressão diferentes não
são equivalentes.
