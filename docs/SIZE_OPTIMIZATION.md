# Redução de tamanho — 2.6.1

[Voltar ao README](../README.md)

A distribuição standalone passa de aproximadamente 3,12 MB para 1,84 MB de
JavaScript, ou de 677 KB para 453 KB gzip. O pacote npm passa de aproximadamente
1,62 MB para 1,40 MB. A versão 2.6.1 permanece preparada localmente, sem publicação.

## O que mudou

O build acrescenta uma etapa de minificação ES com Terser 5.50.0, fixado como
dependência de desenvolvimento. Ela remove comentários de documentação e
espaços da distribuição, preservando avisos de licença/copyright e as
anotações de pureza necessárias para o consumidor eliminar código não utilizado.
Não há mudança no código de execução dos renderers ou na API nesta etapa.

O Vite 4 evita a minificação completa de bibliotecas ES para não perder essas
anotações. Por isso, apenas configurar `build.minify: 'terser'` também não
resolve nessa versão. O plugin `build/minifyLibrary.ts` executa depois dos
transforms do Vite, antes de o Rollup finalizar os hashes dos chunks.
[Documentação do Vite 4](https://v4.vite.dev/config/build-options.html#build-minify).

A configuração mantém `preserve_annotations`, comentários de licença e as
otimizações seguras padrão; não renomeia propriedades nem habilita transformações
matemáticas inseguras. Um teste produz a biblioteca minificada, recompila um
consumidor dela e verifica a remoção de uma chamada opcional e a preservação de
um registro obrigatório. [Opções do Terser](https://terser.org/docs/options/).

## Tamanho medido

A referência é a 2.6.1 local após as otimizações anteriores de inicialização e
cache. As medições somam cada arquivo comprimido separadamente, como em respostas
HTTP independentes. Valores da variante de minificação antes da documentação final:

| Medida | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| JavaScript standalone, bruto | 3.115.774 B | 1.839.032 B | 41,0% |
| JavaScript standalone, gzip | 676.523 B | 452.608 B | 33,1% |
| JavaScript standalone, Brotli | 535.095 B | 374.184 B | 30,1% |
| Renderer cinemático, gzip | 427.002 B | 253.048 B | 40,7% |
| Importação inicial, gzip | 12.182 B | 10.656 B | 12,5% |
| Pacote npm `.tgz` | 1.621.895 B | 1.393.301 B | 14,1% |

O tamanho final do `.tgz` inclui também este relatório e as atualizações de
documentação; os valores exatos do arquivo entregue constam no `pack.json`
gerado junto dele. O JavaScript total inclui todos os chunks opcionais: a
redução é de bytes efetivos, além do carregamento sob demanda já existente.

### Efeito no frontend

O consumidor `external` recompila Babylon com Vite 8.2.2 e Core 9.22.0. Esse
build já removia espaços e comentários. Na fixture com essas dependências,
o JavaScript total passou de 461.929 para 461.729 bytes gzip, apenas **0,04%**.
Portanto, o ganho de 33% do standalone não deve ser anunciado como ganho do
bundle atual do frontend. A redução maior beneficia a distribuição npm e o
carregamento direto da biblioteca standalone/CDN.

## Hipóteses avaliadas

A busca foi limitada a três hipóteses. Os resultados ficaram em
`benchmarks/size-*.json` e as distribuições intermediárias foram preservadas em
`../output/dice3d-size/` para comparação.

| Hipótese | Resultado | Decisão |
| --- | --- | --- |
| Minificação completa preservando anotações | −33,1% gzip no JS standalone; −14,1% no npm | Aplicada |
| Engine com registros explícitos e menos serviços | Após restaurar os registros necessários, economizou somente 3.141 B gzip extras no standalone e 1,3% no JS da fixture do frontend | Não aplicada; o ganho pequeno adicionava manutenção na integração com Babylon |
| Reotimizar Havok com Binaryen 132 e `-Oz` | WASM de 2.094.566 para 2.090.034 B brutos; Brotli de 501.418 para 494.553 B, −1,37% | Não aplicada; insuficiente para manter um binário derivado e uma nova etapa de compilação |

Na experiência com imports reduzidos, os primeiros smokes detectaram ausência
de serviços de uniform buffers e descarte. A variante corrigida passou nos
testes WebGL 1/2, mas a economia adicional continuou pequena. O código final
mantém o import e os registros originais de Babylon.

A experiência com Binaryen preservou imports e exports do módulo. Ela foi
rejeitada já na medição de tamanho; não foi promovida a testes de desempenho
físico nem incorporada ao pacote. O WASM entregue permanece byte a byte igual
ao anterior. [Binaryen](https://github.com/WebAssembly/binaryen).

## Verificação e reprodução

```bash
npm ci
npm test
npm run build
npm run bundle:metrics
npm run e2e:startup -- dist ../output/dice3d-size/release/smoke.png
node scripts/compare-size.mjs ../output/dice3d-size/baseline dist benchmarks/size-final-comparison.json
node scripts/build-startup-host.mjs dist ../front/node_modules ../output/dice3d-size/host-release
npm run e2e:startup -- ../output/dice3d-size/host-release ../output/dice3d-size/release/smoke-host.png
```

Para verificar o fallback WebGL 1 em PowerShell:

```powershell
$env:DICE_SMOKE_WEBGL1 = '1'
npm run e2e:startup -- dist ../output/dice3d-size/release/smoke-webgl1.png
```

A suíte inclui 147 testes. Os smokes cobrem moedas, d4–d100, temas simbólicos,
física, sombras, efeitos da timeline, cancelamento, cache e descarte durante
cargas. A declaração pública `dist/index.d.ts` permanece idêntica. O check de
bundle passa a limitar o JavaScript standalone a 2 MiB brutos e 480 KiB gzip
para detectar a perda da minificação ou o crescimento de dependências.

O rollback desta etapa consiste em remover o plugin `minifyLibrary`, reverter
o limite de tamanho correspondente e reconstruir `dist`. As otimizações anteriores
de inicialização, cache e preparação de temas são independentes dessa mudança.
