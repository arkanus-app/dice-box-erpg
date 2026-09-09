# Inicialização do Dice3DView 2.6.1

[Voltar ao README](../README.md)

Análise da versão 2.6.0 no commit `345bc3e`, em 9 de setembro de 2026.
A versão 2.6.1 está preparada localmente; não foi publicada no npm.

## Mudanças

- A API passa a carregar os renderers sob demanda. Importar o pacote não
  inicializa Babylon nem baixa física ou shaders.
- Em modo físico, o pequeno loader do Havok começa a buscar o WASM enquanto
  o navegador carrega Babylon. Cena, sombras e física deixam de esperar uma
  pela outra quando são independentes.
- O runtime Havok da última URL solicitada é compartilhado; cada plugin
  continua criando e liberando seu próprio mundo físico. A chave inclui query
  string e origem. Uma falha não fica presa no cache.
- `init()` simultâneos compartilham o trabalho. Uma inicialização que termina
  depois de `dispose()` libera o renderer em vez de reativá-lo.
- Babylon passa de dependência fixa 9.18.0 para peer compatível `^9.18.0`,
  mantendo 9.18.0 no desenvolvimento. O ERPG também fixa a deduplicação de
  Babylon/Havok no Vite para proteger aplicações que ainda usam a 2.6.0.

## Preservação de recursos

Não foram alterados os algoritmos de trajetória, colisão, orientação, resolução
de valores ou timeline. Permanecem os modos cinemático e físico, moedas d2,
d4–d100, dados descartados, sombras configuráveis e temas de Vampiro V5,
Assimilação, Fate e Daggerheart.

O smoke de produção verifica inicialização concorrente, desmontagem antes e
durante a inicialização, falha HTTP do WASM seguida de retry, troca entre os
modos, troca de sombras, temas mistos, explosão, destaque de crítico,
cancelamento, callbacks da timeline e ausência de erros no console.

## Medição com o frontend

Fixture de produção com Vite 8.2.2 e Babylon 9.22.0 do ERPG. Chromium 147,
emulação Pixel 5, canvas ocupando toda a viewport, CPU limitada em 4×, latência
de 60 ms, download de 1,6 MB/s e Brotli. São cinco contextos novos por condição;
os valores abaixo são medianas. O teste mede uma máquina desktop com emulação,
não um telefone físico nem tráfego real de produção.

| Medida | 2.6.0 | 2.6.1 | Redução |
| --- | ---: | ---: | ---: |
| Pronto, sem sombras | 1.657 ms | 1.235 ms | 25,5% |
| Pronto, com sombras | 1.802 ms | 1.315 ms | 27,0% |
| Recriar viewer, sem sombras | 223 ms | 97 ms | 56,5% |
| Recriar viewer, com sombras | 252 ms | 156 ms | 38,0% |
| Primeira apresentação completa, sem sombras | 4.504 ms | 4.090 ms | 9,2% |
| Primeira apresentação completa, com sombras | 4.655 ms | 4.218 ms | 9,4% |

A repetição com ordem invertida confirmou o ganho: 1.551 → 1.202 ms sem
sombras (22,5%) e 1.738 → 1.189 ms com sombras (31,6%). A recriação caiu
de 175 → 76 ms e de 232 → 134 ms, respectivamente. Os tempos variam entre
rodadas; a redução no caminho completo até `init()` se manteve.

Na distribuição standalone, a importação passou de 2.120.423 para cerca de
46.364 bytes brutos, ou de 438.335 para aproximadamente 12.150 bytes gzip
(97,2% menos gzip inicial). O tamanho total do JavaScript permanece praticamente
igual: o motor passa a ser solicitado em `init()`. O WASM continua com 2.094.566
bytes brutos; no ambiente medido, 501.418 bytes Brotli.

Os JSONs em `benchmarks/startup-*.json` registram amostras e uma repetição com a
ordem invertida, para verificar se a melhoria depende da ordem de execução.
Com cinco amostras, o p95 registrado corresponde ao maior valor observado e não
é uma estimativa estável de produção. As rodadas exploratórias anteriores
usavam o canvas padrão de 300×150 e ficam fora desta comparação final.

## Variantes avaliadas

| Variante | Hipótese | Decisão |
| --- | --- | --- |
| 1 | Adiar apenas o renderer cinemático | Importação mais leve, sem ganho de `readyMs`; insuficiente isoladamente. |
| 2 | Compartilhar Havok e paralelizar cena/sombras | Melhora recriação e abertura com sombras; mantida na próxima variante. |
| 3 | Antecipar o download do WASM junto do renderer | Melhor variante medida para primeira abertura e recriação; inclui proteções de lifecycle. |

Busca limitada a três variantes. A deduplicação de Babylon é validada à parte:
a fixture já compartilha o motor nos dois lados, evitando atribuir ao pacote um
ganho que vem apenas da configuração do host.

## Como reproduzir

```sh
npm ci
npm run build
npm test
npm run e2e:startup
npm run benchmark:startup -- dist benchmarks/startup-local.json
```

Para rebundlar com as versões de Vite e Babylon de uma aplicação real:

```sh
node scripts/build-startup-host.mjs dist ../front/node_modules ../output/dice3d-startup/host
node scripts/startup-smoke.mjs ../output/dice3d-startup/host
npm run benchmark:startup -- ../output/dice3d-startup/host benchmarks/host-local.json
node scripts/compare-startup.mjs benchmarks/startup-baseline.json benchmarks/startup-optimized.json
```

Salve o `dist` anterior fora do checkout antes de compilar a variante. Use o
mesmo script, rede, CPU e CSS do canvas nos dois lados da comparação. O servidor
pré-comprime os arquivos antes de abrir o navegador, para não medir compressão
como latência de inicialização. `STARTUP_RUNS`, `STARTUP_LATENCY_MS` e
`STARTUP_CPU_RATE` permitem repetir o ensaio com outras condições.

## Limites e custos

`readyMs` mede importação, construção e `init()`. `firstPresentationMs` inclui
também toda a animação; não é uma medida do primeiro frame visível. O tempo de
importação menor, isoladamente, não demonstra inicialização mais rápida.

O runtime compartilhado mantém um heap WASM disponível para a próxima abertura.
O cache retém apenas a última URL para limitar a retenção ao trocar revisões;
mundos ativos continuam válidos quando essa entrada muda. O tamanho do binário
Havok não foi reduzido. A economia de bytes da importação vem do carregamento
sob demanda, não da remoção de recursos.

A fixture do consumidor já deduplica Babylon nos dois lados, para medir o ganho
do pacote isoladamente. O frontend real tinha Babylon 9.22.0 no host e 9.18.0
aninhado em Dice3DView. O build móvel com a correção de Vite confirmou zero
módulos aninhados; ele ainda usa a dependência publicada 2.6.0.

Próximos pontos: o fallback CDN do ERPG ainda aponta para v2.2.3; deve ser
alinhado a uma tag compatível após a publicação. Alterações de cor também podem
remontar o viewer no React; migrar esse caso para `updateOptions()` exige
validação própria do lifecycle e pode evitar até a recriação do WebGL.

## Verificação da entrega

- `npm run build`: temas, TypeScript, três distribuições, documentação e
  estrutura de chunks aprovados; declarações públicas `dist/index.d.ts` sem alteração.
- `npm test`: 131 testes aprovados, incluindo runtime compartilhado,
  isolamento dos mundos, falhas recuperáveis e URL inválida.
- `startup-smoke.mjs`: standalone em Babylon 9.18 e host em Babylon 9.22,
  com inspeção visual da apresentação mista.
- Frontend: 28 testes focados aprovados; Biome nos dois arquivos alterados;
  `npm run build:mobile:web` e `npm run dice3dview:mobile:check` aprovados,
  com zero módulos de Babylon aninhados no viewer.
- Instalação do `.tgz` em consumidor isolado: imports `external` e `adapters`
  aprovados, versão 2.6.1 confirmada e Babylon 9.22.0 deduplicado pelo npm.

O pacote local pode ser instalado a partir de `erpg-dice3dview-2.6.1.tgz`.
O frontend permanece apontando para a versão publicada até que a 2.6.1 seja
publicada e o lockfile seja atualizado; a deduplicação do Vite já foi aplicada.
