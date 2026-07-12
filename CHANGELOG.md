# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui. O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e a versão usa [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não publicado]

## [2.0.3] - 2026-07-12

### Adicionado

- barreiras físicas e piso responsivos ao tamanho e à proporção reais do canvas;
- observação automática do container com `ResizeObserver`, mantendo o fallback de `window.resize`;
- uso efetivo de `wallPadding` como recuo interno da área útil, medido em unidades do palco.

### Alterado

- lançamentos laterais e pousos dispersos agora são confinados aos limites visíveis do palco;
- as paredes são reconstruídas quando o canvas, o aspect ratio ou as opções físicas mudam;
- corpos ativos são reposicionados para dentro da nova área útil quando o container é redimensionado.

### Corrigido

- dados que escapavam pelas bordas visíveis da página porque os colliders ainda usavam dimensões fixas;
- piso e paredes que não acompanhavam viewers compactos, overlays e layouts responsivos;
- pontos iniciais ou finais que podiam ficar fora das barreiras em telas estreitas.

## [2.0.2] - 2026-07-12

### Adicionado

- documentação completa em português para API, assets, temas e migração;
- devlog técnico e changelog da v2;
- subpath público estável `@erpg/dice3dview/style.css`;
- export público do tipo `ThemeMaterialConfig`.

### Corrigido

- consumidores agora podem importar o CSS extraído pelo build sem depender de um nome de arquivo com hash.

## [2.0.1] - 2026-07-12

### Adicionado

- perfis físicos pré-calculados para d2, d4, d6, d8, d10, d12, d20 e d100;
- máquina de estados `freeFall → guidedSettle → finalLock → commit → complete`;
- motor angular quaternion no corpo Havok;
- multiplicadores de massa por geometria;
- cálculo e cache da altura de apoio por collider, face e orientação;
- recuperação de corpos não finitos ou fora do volume físico;
- testes de bounds, segurança, trajetória, guidance e todas as 60 faces poliedrais.

### Alterado

- a física usa os colliders dedicados dos modelos;
- a simulação usa subpassos de 90 Hz;
- o chão físico passou a cobrir todo o plano visual e ganhou maior espessura;
- dados partem alternadamente das laterais e repousam em dispersão natural determinística;
- a câmera foi afastada mantendo o enquadramento do chão;
- a orientação final recebe yaw global sem mudar a face selecionada;
- meshes reutilizados recebem escala absoluta, evitando acúmulo no pool.

### Corrigido

- composição de `themeColor` com a máscara alfa das texturas, sem reintroduzir `@babylonjs/materials`;
- orientação de texturas diffuse, normal e specular;
- dados que atravessavam o chão ou escapavam indefinidamente;
- tamanho aparente exagerado no início do lançamento;
- alinhamento artificial em grade ao fim da apresentação;
- divergência entre o valor resolvido e a face física visível;
- correção visual tardia que era sobrescrita pela sincronização do Havok;
- altura final genérica que fazia objetos flutuarem ou interceptarem o piso.

### Validado

- 33 testes em 11 suítes;
- 60 faces nativas verificadas matematicamente;
- d20, múltiplos d6/d20 e d100 conferidos no frontend local;
- commit final confirmado depois de um subpasso físico real.

## [2.0.0] - 2026-07-12

### Adicionado

- `DiceResultViewer` com `init`, `display`, `clear`, `updateOptions`, `resize` e `dispose`;
- API TypeScript estrita com declarações publicadas;
- contratos `DisplayRequest`, `ResolvedDie` e `DisplayResult`;
- modo `kinematic` como renderer padrão;
- modo `physics` e Havok carregados por chunk lazy;
- d2 como moeda procedural configurável por tema;
- fallback numérico da moeda no tema padrão;
- suporte a d2, d4, d6, d8, d10, d12, d20 e d100;
- `DisplayCancelledError`, código `DISPLAY_CANCELLED` e helper de reconhecimento;
- caches de configurações, modelos e materiais;
- pools de meshes e moedas;
- distribuição ESM com chunks lazy e tipos TypeScript;
- verificação automatizada de orçamento e ausência de Havok no grafo cinemático.

### Alterado

- a biblioteca passou a ser exclusivamente visual;
- valores resolvidos pelo chamador se tornaram a única autoridade;
- `seed` passou a controlar somente a apresentação;
- d100 passou a ser tratado como um resultado semântico com dois corpos visuais;
- falhas gráficas passaram a preservar e devolver os resultados autoritativos.

### Removido

- `WorldFacade`, `displayRoll()` e nomenclatura herdada de rolagem;
- `forcedResultMode`;
- infraestrutura e nomenclatura herdadas de “roll” que não pertenciam à apresentação;
- leitura da face superior como autoridade do resultado;
- `rollCollectionData` e estruturas herdadas relacionadas;
- mundos onscreen, offscreen e none duplicados;
- worker OffscreenCanvas;
- builds paralelos minificado/não minificado;
- dependência `@babylonjs/materials`;
- assets antigos de Ammo.

### Desempenho

- `dist` reduzido de 15.955.179 para 7.803.079 bytes no lançamento da v2;
- quantidade de artefatos significativamente reduzida;
- orçamento total definido em 8 MiB.

## [1.0.6] - 2026-05-30

### Adicionado

- primeira implementação ERPG de física guiada com parâmetros por tipo de dado, introduzida no commit `7462f2c` em 23/05/2026;
- correção assistida de resultados externos nos modos `physics` e `visual`.

### Alterado

- tema `default-v2` consolidado no baseline `81c2ca9` em 30/05/2026.

[Não publicado]: https://github.com/arkanus-app/dice-box-erpg/compare/v2.0.3...HEAD
[2.0.3]: https://github.com/arkanus-app/dice-box-erpg/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/arkanus-app/dice-box-erpg/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/arkanus-app/dice-box-erpg/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/arkanus-app/dice-box-erpg/compare/81c2ca948d6de742ea43b836848524a43019d50f...v2.0.0
[1.0.6]: https://github.com/arkanus-app/dice-box-erpg/commit/81c2ca948d6de742ea43b836848524a43019d50f
