# Estrutura e carregamento de recursos — 2.6.1

[Voltar ao README](../README.md)

A revisão de 9 de setembro de 2026 acrescenta melhorias à versão 2.6.1 ainda
não publicada. A referência desta medição já contém as
[otimizações anteriores de inicialização](STARTUP_PERFORMANCE.md).

## Mudanças aplicadas

### Preparação compartilhada de temas

`src/renderers/prepareThemes.ts` concentra a preparação usada por `display()`
e `displayTimeline()`, tanto no modo cinemático quanto no físico. Uma passagem
identifica temas distintos e quais precisam de poliedros; isso elimina as
varreduras de todos os dados repetidas para cada tema e a recriação de arrays
das definições da timeline.

Até quatro cargas de tema/modelo avançam simultaneamente. O cache de modelos
continua compartilhando a mesma promise para uma URL, portanto os temas
embutidos que usam `default.json` não duplicam o download nem o parsing.
Temas usados exclusivamente por moedas dispensam o modelo de poliedros.

Os workers iniciados terminam antes de uma falha retornar ao renderer. Falha
ou cancelamento impedem novas etapas. Os callbacks `onThemeLoaded` são emitidos
após o sucesso da preparação, na ordem da primeira ocorrência dos temas.
`onThemeConfigLoaded` acompanha a ordem de conclusão das requisições.

### Cache com invalidação por caminho

`createUpdatedViewerOptions()` copia o objeto `externalThemes`. O repositório
anterior comparava a identidade desse objeto e invalidava todos os temas mesmo
em atualizações apenas de cor, luz, duração ou callbacks.

Agora o repositório compara os caminhos de cada tema cacheado. Mapeamentos
inalterados preservam configurações e promises em andamento. Alterações de
origem ou diretório base ainda invalidam todos os temas, inclusive os externos
que usam modelos ou moedas de fallback.

Os caminhos são capturados no início da requisição. Uma resposta antiga não
mistura sua configuração com assets da nova origem, e uma rejeição antiga só
remove sua própria promise do cache. As regressões desses casos foram
reproduzidas antes da correção.

### Propriedade e descarte dos modelos

`PolyhedralFactory` passa a possuir explicitamente seus templates de mesh e
o cancelamento de seus downloads. `dispose()` aborta as cargas e libera os
templates; respostas tardias não podem fazer parsing ou criar instâncias.
Se um parsing falhar, as meshes já criadas naquela carga são liberadas antes
de permitir uma nova tentativa.

No teste isolado da factory, o descarte deixava 14 templates no `Scene` e
agora deixa zero. Antes, sua liberação dependia do descarte posterior da cena;
isso não representa uma medição de heap do frontend. A regressão de parsing
parcial também passa de uma mesh remanescente para zero.

## Evidência de desempenho

Busca limitada a duas hipóteses: corrigir a invalidação do cache e paralelizar
a preparação. O descarte dos modelos foi tratado como correção de lifecycle,
sem atribuir a ele um ganho de latência.

Chromium 147, build standalone de produção, viewport 900 × 650, seis temas
embutidos, animação e delay configurados em zero. São cinco contextos novos por
tipo de apresentação. Cada requisição JSON de tema/modelo recebe 60 ms de
atraso controlado; o cache HTTP está desabilitado para tornar os acessos da
biblioteca observáveis. Importação, criação do engine e `init()` ocorrem antes
do intervalo medido. CPU e banda não são limitadas neste benchmark.

`preparedMs` vai do início da apresentação até o último `onThemeLoaded`.
`totalMs` inclui também criação dos dados e conclusão do renderer. Medianas:

| Operação | Referência | Versão final | Redução |
| --- | ---: | ---: | ---: |
| Preparar primeira rolagem | 442,0 ms | 230,5 ms | 47,9% |
| Preparar primeira timeline | 450,1 ms | 226,6 ms | 49,7% |
| Concluir primeira rolagem | 754,2 ms | 524,8 ms | 30,4% |
| Concluir primeira timeline | 768,1 ms | 515,4 ms | 32,9% |
| Preparar rolagem após mudar cor/luz | 563,9 ms | 0,9 ms | 99,8% |
| Preparar timeline após mudar cor/luz | 562,9 ms | 0,9 ms | 99,8% |
| Cargas de configuração após mudar cor/luz | 6 | 0 | 100% |

O caso após atualização usa o mesmo viewer e os mesmos temas. A preparação
em aproximadamente 1 ms não inclui a apresentação completa, que levou cerca
de 268 ms. O ganho depende de manter a instância do viewer: desmontá-la e criar
outra também cria outro repositório de temas.

| Variante | Primeira preparação, rolagem / timeline | Após atualização, rolagem / timeline |
| --- | ---: | ---: |
| Referência | 442 / 450 ms | 564 / 563 ms |
| Cache corrigido | 439 / 465 ms | 1,0 / 0,9 ms |
| Cache + cargas paralelas | 227 / 231 ms | 0,9 / 0,9 ms |
| Final, incluindo descarte dos modelos | 231 / 227 ms | 0,9 / 0,9 ms |

A repetição da referência depois da versão final retornou 452 / 459 ms na
primeira preparação e 566 / 569 ms após atualizar opções. O ganho se manteve
com a ordem de execução invertida. São medidas de laboratório, sem estimar
percentis de produção ou prometer o mesmo ganho em todos os dispositivos.

A API pública mantém declarações byte a byte idênticas. O grafo inicial passa
de 46.364 para 46.439 bytes brutos, e de 12.151 para 12.182 bytes gzip: acréscimo
de 31 bytes gzip para a correção de cache. O JavaScript standalone total passa
de 676.030 para 676.523 bytes gzip, acréscimo de 493 bytes (0,073%). A preparação
e o descarte continuam no renderer carregado sob demanda. O WASM e os assets
não mudaram. Os bytes e hashes estão em `benchmarks/structure-bundles.json` no
repositório-fonte.

## Reprodução e validação

Antes de editar, foi preservada uma cópia de `dist` em
`../output/dice3d-structure/baseline`. As amostras e variantes estão em
`benchmarks/themes-*.json` no repositório-fonte.

```bash
npm test
npm run build
node scripts/theme-benchmark.mjs ../output/dice3d-structure/baseline benchmarks/themes-baseline.json
npm run benchmark:themes -- dist benchmarks/themes-final.json
node scripts/theme-benchmark.mjs ../output/dice3d-structure/baseline benchmarks/themes-baseline-confirmation.json
npm run e2e:startup -- dist ../output/dice3d-structure/smoke-standalone.png
node scripts/build-startup-host.mjs dist ../front/node_modules ../output/dice3d-structure/host
npm run e2e:startup -- ../output/dice3d-structure/host ../output/dice3d-structure/smoke-host.png
```

A suíte tem 146 testes, incluindo 15 novos casos de cache, concorrência e
propriedade dos modelos. O benchmark verifica valores autoritativos, ordem e
quantidade dos callbacks e ausência de erros no navegador. O smoke também
cobre descarte durante o download de modelos em rolagens e timelines, além
dos recursos gráficos e de física já existentes.

Os limites do cache de materiais e moedas permanecem documentados em
[Temas](THEMES.md): para substituir a definição de um tema ou modelo já
carregado, recrie o viewer. Nenhuma mudança foi feita nas trajetórias,
orientações das faces, regras físicas ou semântica dos eventos.
