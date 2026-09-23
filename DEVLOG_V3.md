# Devlog da v3

[← Voltar ao README](README.md)

## Objetivo

A v2 apresentava bem os resultados, mas carregava Babylon.js e Havok: cerca de
1,16 MB gzip no modo físico, incluindo um WASM de 2 MB compilado antes do
primeiro arremesso. A v3 buscou a mesma API e a mesma expectativa visual (dados
que colidem, quicam, empilham e mostram o valor resolvido) com uma fração do
peso e rodando em qualquer navegador com WebGL.

## Arquitetura

```text
src/engine/      matemática, casco convexo, simulação, coreografia e trilhas
  vector.ts        vetores e quaternions em tuplas
  shape.ts         casco a partir do collider do tema, grupo de simetria, leitura de face
  simulation.ts    corpo rígido determinístico (gerador fatiável)
  launch.ts        coreografia de lançamento portada da v2
  throw.ts         plano de lançamento por apresentação
  physicsThrow.ts  arremesso inicial, fases seguintes, políticas e fatiamento
  track.ts         amostragem das poses gravadas (+ rotação visual G)
src/render/      WebGL próprio: shaders, malhas, texturas, materiais da v2, moedas
src/renderers/   SceneRenderer: timeline, reprodução, efeitos
```

## Decisões

### Resultado por simetria, não por guia

A v2 levava o dado à face pedida com preflight, torque e lock. A v3 simula
livremente e, quando o dado para, escolhe uma rotação *G* do grupo de simetria
do casco que leva a face do resultado até a face que ficou para cima. Como *G*
mapeia o casco sobre si mesmo, ela é aplicada ao desenho do primeiro ao último
quadro sem mudar nada da física. Os grupos dos modelos padrão foram verificados
(ordens 12, 24, 24, 10, 60 e 60 para d4, d6, d8, d10, d12 e d20).

### Determinismo

Só `+ − × ÷` e `√` no laço, estado escalar e ordem de iteração fixa. A mesma
`seed` produz quadros idênticos em qualquer motor JavaScript, e o cálculo
fatiado é idêntico ao síncrono (há testes para os dois).

### Contatos

Contatos especulativos no estilo do Box2D v3 (margem pela velocidade de
aproximação), SAT com manifold recortado por Sutherland–Hodgman entre faces e
pontos mais próximos entre arestas, restituição em passe separado e correção de
posição. A penetração transitória em 12d6 fica abaixo de 25% do raio.

### Repouso e custo de mesas cheias

Medir repouso por velocidade instantânea não funciona em pilhas: um passo sem
apoio soma g·dt (≈0,2 u/s) e zera o cronômetro. A v3 mede o deslocamento numa
janela de tempo e aplica amortecimento de repouso a corpos lentos em contato.
Acima de 40 corpos, o passo fica mais grosso e dados parados passam a sustentar
os seguintes sem voltar a ser simulados. Isso, um broadphase por varredura
ordenada e a política por quantidade de corpos levaram 60d6 de ~1 s para
~124 ms de CPU.

A coreografia da v2 solta lances grandes em waves espaçadas para a velocidade
mínima de portal (≈0,8 s por wave). Como a velocidade real de lançamento é
conhecida antes da simulação, a v3 espaça as waves por ela: a apresentação de
120 dados caiu de ~19 s para ~12 s.

### Só física

Decisão de produto durante o alpha: manter um único modo. O modo cinemático foi
removido; `mode: 'kinematic'` continua aceito e é apresentado com física.
Rerolagens e explosões tardias passaram a ser simuladas: os dados em movimento
são simulados e os demais viram obstáculos fixos, então nada que já foi mostrado
muda. Na rerolagem o dado parte do repouso, e *G* é misturada só enquanto ele
está no ar, para não haver salto de textura.

### Visual

- Materiais da v2 reproduzidos (cor com máscara, texturas, bump, specular).
- O halo de efeito desenha apenas as faces de trás de uma casca inflada: o
  brilho fica no contorno e o número continua legível.
- Dados esmaecidos usam pré-passe de profundidade: um sólido translúcido, sem
  faces internas aparecendo.
- Os badges `Σ` e `−1` foram removidos por feedback de uso: o card piscando
  sobre o dado atrapalhava a leitura.
- Os atlas simbólicos (V5, Assimilação, Fate) tinham glifos desalinhados das
  faces. `scripts/align-symbol-atlases.mjs` os realinha pela transformação UV
  de cada face e publica `glyph-orientation.json`, usado para mostrar os
  símbolos em pé.

### Transições e imersão

Uma biblioteca visual não pode deixar nada "aparecer do nada":

- **Filho de explosão no centro da tela (bug).** O quadro de estreia era
  calculado um passo cedo: por um quadro, o filho aparecia na posição de espera
  (0, −50, 0), exatamente sob a câmera, e subia atravessando a mesa. O quadro
  de estreia agora é o primeiro que já contém o corpo, e o filho sai de dentro
  do pai: nasce com 25% do tamanho no centro do pai e cresce até a posição
  física em 0,2 s, enquanto ainda está no ar. Um teste cobre isso.
- **Relógio sem saltos.** A reprodução avançava pelo relógio de parede; um
  quadro lento (primeira compilação de shader, upload de textura, main thread
  ocupada) fazia os dados pularem para frente. Agora o relógio avança no máximo
  50 ms por quadro.
- **Antecipação.** Antes de uma rerolagem ou de uma explosão tardia, o dado
  brilha e treme (±4°, ~12 Hz, com leve elevação) e volta exatamente à pose de
  repouso, de onde a simulação parte.
- **Anéis de choque** no chão marcam explosões, decolagens de rerolagem e
  críticos.
- **Saída.** Uma nova apresentação tira os dados anteriores com um fade de
  280 ms enquanto os novos entram pela borda.
- **Descarte por saturação.** Descartados perdem a cor em vez de ficarem
  translúcidos, e em keep/drop os que sobraram brilham, o que destaca o
  resultado sem esconder o que foi descartado.

### Efeitos: partículas, condições e brilho

A proposta é uma biblioteca visual completa e leve, então os efeitos são
declarativos e o motor só é baixado quando usado:

- **Formas.** Cada partícula é um point sprite com forma e ângulo no próprio
  vértice (10 floats por partícula): luz suave, faísca (alinhada ao movimento;
  a câmera olha de cima, então x/z do mundo são x/y da tela), estrela, anel,
  confete (tira de papel que vira, escurecendo de lado) e fumaça irregular.
- **Momentos.** `ground` emite por distância percorrida e deita as partículas
  na mesa, formando rastros; `collision` separa o choque entre dados do
  impacto na mesa (antes eram um só).
- **Condições.** `when` decide quando um emissor toca: força mínima do golpe,
  velocidade mínima, tipos de dado, faces (`max`, `min` ou lista, sempre do
  dado inteiro), chance e intervalo por dado. Em momentos contínuos a chance é
  sorteada uma vez por dado e rolagem, para o rastro não "piscar".
- **Ajustes rápidos.** `color` recolore cada parada da rampa na matiz
  escolhida mantendo a luminância (núcleos quentes continuam claros, caudas
  continuam escuras); os resultados ficam em cache por efeito.
- **Edição ao vivo.** Trocar `particles` reconfigura o motor na hora; o editor
  da demo usa isso e `playParticles()` para testar um momento sem precisar
  achar uma rolagem com explosão ou crítico.
- **Brilho.** A luz própria entra em modo *screen* sobre a superfície: dados
  escuros ganham a cor da luz, dados claros não estouram para branco. O halo
  reaproveita as faces de trás infladas, e a luz na mesa é um disco aditivo
  desenhado antes das sombras.
- **Fogo.** Uma versão do preset com sprites de fumaça ficou pior que a de luz
  suave, e o preset voltou ao desenho anterior (ganhou só as brasas no chão).
- **Moedas.** Elas recebiam a cor chapada e sem luz, e a skin não aparecia. As
  faces agora são camadas como os dados (cor, skin, arte por cima) e a marca
  neutra da moeda inverte para escuro em corpos claros, como o atlas.

### Nada de corte por tempo

"Às vezes a animação para no meio, mesmo com explosões por terminar." A causa
era o `maxTime` da simulação: o arremesso inicial tinha até
`último lançamento + settleTimeout + 1,7 s` e as fases seguintes, 3,5 s fixos.
Quando o tempo acabava, o laço simplesmente parava: dados no ar congelavam e,
numa cadeia de explosões, os filhos cujo pai ainda não tinha dormido nunca
nasciam (reprodução: cadeia de 4 explosões perdia 1 a 3 dados em todas as
sementes testadas).

Agora o tempo é um orçamento. Cada corpo tem um passo a partir do qual entra em
"prorrogação": ali ele perde um pouco mais de energia a cada segundo (horizontal
e rotação; a queda nunca é amortecida), como um feltro mais áspero, até dormir.
Filhos de explosão contam o orçamento a partir do próprio nascimento, então uma
cadeia de 6 explosões termina inteira (~12 s). Um limite de segurança de 30 s de
prorrogação só existe para casos patológicos. O custo não mudou (benchmark da
física igual), e um teste cobre a cadeia.

### Moedas são dados de dois lados

O halo de efeito dos dados é a casca de trás inflada ao longo das normais. Na
moeda só a borda era desenhada, e a borda vista de cima é um anel de largura
quase zero: o brilho próprio e os destaques da timeline praticamente sumiam. O
halo da moeda agora cresce a moeda inteira (faces e borda), e a moeda recebe o
mesmo corpo iluminado, skin, luz na mesa, partículas e descarte dos dados.

### Oficina e arquivos de visual

A oficina (`demo/oficina.html`) monta visuais completos e exporta um arquivo
`*.dice-look.json` (`format`, `version`, cor, skin com a textura embutida em
WebP, partículas como definição completa e brilho). A biblioteca só lê o
arquivo: `diceLookOptions()` valida tudo com os mesmos validadores das opções e
`applyLook()` aplica. Como o efeito vai completo, quem aplica um visual não
baixa o chunk de presets; ele virou um chunk à parte (3,6 KB) para isso.

Os presets passaram a 15, todos com os oito momentos, sete deles combinando
elementos (lava, tempestade, sagrado, sombra, veneno, natureza e cósmico). O
editor permite trazer um momento de outro efeito (confete no impacto e fogo no
rastro, por exemplo). As 18 texturas da demo são procedurais e repetíveis sem
emenda.

### Licença

A partir da 3.0.0 o pacote usa uma licença própria: livre para projetos de
código aberto, com autorização por escrito para os demais usos. Versões
anteriores continuam MIT, e as partes herdadas do `@3d-dice/dice-box` (formato
de tema e assets dos temas padrão) seguem sob a MIT original em
`THIRD_PARTY_NOTICES.md`.

## Medições

- Biblioteca: 127.656 B raw, 43.608 B gzip, 38.022 B Brotli, um arquivo, zero
  dependências; sob demanda: motor de partículas 4.328 B gzip e presets
  3.558 B gzip ([métricas](docs/BUNDLE_METRICS.md)).
- Contra a v2 ([benchmarks](docs/BENCHMARKS.md)): 26,6× menos download que a v2
  física e compilação JS de 6,8 ms contra 34 ms no V8.
  Os efeitos novos (brilho, condições, formas) custariam ~3 KB no módulo
  principal; mover o shader de partículas para o chunk e compactar a saída
  (espaços do ESM e comentários do GLSL) deixou o módulo menor que antes deles.
- CPU por arremesso (Node, sem throttle): d20 1,8 ms, 12d6 15 ms, 24d6 50 ms,
  60d6 124 ms, 120d6 400 ms ([desempenho](docs/PHYSICS_PERFORMANCE.md)).

## Próximos passos

- Medir import, `init()` e primeira apresentação em aparelhos reais e no
  Chromium com perfil móvel (o smoke de Playwright precisa do navegador
  instalado localmente).
- Publicar a orientação dos dígitos dos temas numéricos (`default`,
  `default-v2`) para apresentar números em pé, como já acontece com os
  símbolos.
- Lances acima de 40 corpos: como dados parados não voltam a ser simulados, a
  reprodução poderia começar antes do fim do cálculo (streaming).
- Comparação visual lado a lado com a v2 para calibrar o "peso" do arremesso.
- d3 nativo, herdado da lista da v2.
