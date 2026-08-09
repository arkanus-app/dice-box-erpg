# Métricas de bundle e carregamento

[← Voltar ao README](../README.md)

Esta entrega substitui o antigo limite agregado de 8 MiB por medições que
representam os caminhos realmente carregados pelo consumidor. Ainda não há uma
meta percentual: o primeiro resultado confiável fica versionado em
[`bundle-baseline.json`](../benchmarks/bundle-baseline.json).

O custo por frame do renderer físico é medido separadamente no
[benchmark do hot path físico](PHYSICS_PERFORMANCE.md); ele não deve ser
inferido pelo tamanho dos chunks.

## Como medir

Gere todos os entrypoints e execute:

```bash
npm run build:bundles
npm run bundle:metrics
npm run bundle:check
```

`bundle:metrics` informa bytes raw, gzip e Brotli e quantidade de arquivos para:

- grafo inicial dos builds legado e `external`;
- incrementos de física, profiling opt-in, sombras e highlight/timeline;
- runtime Havok JS separado do chunk do renderer físico;
- JavaScript completo de cada distribuição;
- entrypoint `adapters`;
- Havok WASM, assets, diretório `dist` e pacote npm.

`bundle:check` valida a topologia, não uma porcentagem arbitrária: o build
legado precisa continuar autocontido; `external` precisa preservar imports bare
de Babylon/Havok; `adapters` não pode referenciar renderer, Babylon ou Havok; e
física, profiling, sombras e highlight não podem vazar para o grafo inicial. O
check também rejeita um payload WASM base64 dentro do chunk Havok legado.

## Interpretação

O grafo inicial é o custo de importar e iniciar o caminho cinemático sem sombras
e sem timeline. As métricas incrementais contam apenas arquivos que ainda não
estavam nesse grafo. Havok JS aparece separado do renderer físico e o WASM é
medido como arquivo próprio, porque seu download acontece por URL em runtime.
Mesmo no build legado autocontido, o pacote leva uma única cópia estável do
WASM; ela não é repetida como base64 no JavaScript.

O tamanho total de `dist` inclui três distribuições e assets compartilhados;
portanto ele não representa bytes transferidos por uma aplicação. O build
`external` é a referência para npm/bundlers. O build raiz é a referência de
compatibilidade para carregamento direto por CDN.

O baseline de navegador e do build móvel do frontend deve ser renovado no mesmo
ambiente sempre que os limites de regressão forem definidos. Registre execuções
frias e quentes, bytes transferidos, requests e tempos de import, `init()` e
primeira apresentação; não compare números coletados com hardware, cache ou
compressão diferentes como se fossem equivalentes.

Na integração do frontend, `npm run build:mobile:web` gera o manifesto e
`npm run dice3dview:mobile:check` mede o fechamento do renderer. O check falha se
encontrar Babylon aninhado sob `@erpg/dice3dview` ou se física, profiling,
sombras ou highlight entrarem no grafo inicial. No build web,
`npm run dice3dview:brotli:check` valida que `HavokPhysics-*.wasm.br` existe, é
menor e descomprime byte a byte para o WASM original. O Worker entrega esse
arquivo somente quando `Accept-Encoding` aceita `br`, preservando fallback para
o WASM original.
