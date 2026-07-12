# Origem do fork e escopo ERPG

`@erpg/dice3dview` é um pacote mantido pela ERPG e derivado do projeto MIT `@3d-dice/dice-box`, da 3Ddice.

O projeto original forneceu a base de renderização de dados com BabylonJS. O fork existe para atender ao contrato do ecossistema ERPG: a matemática é resolvida por `@erpg/dicecore`, enquanto esta biblioteca cuida exclusivamente da apresentação 3D.

## Diferenças arquiteturais da v2

- API TypeScript pública baseada em `DiceResultViewer`;
- entrada composta somente por resultados resolvidos;
- `seed` restrita à apresentação visual;
- d2 procedural e configurável por tema;
- renderer cinemático como padrão;
- renderer Havok carregado por chunk lazy;
- perfis físicos pré-calculados e commit exato da face recebida;
- cache de temas/modelos/materiais/orientações e pools de meshes/moedas;
- um entrypoint ESM com chunks lazy, CSS e declarações TypeScript;
- ausência de `@babylonjs/materials`.

## Componentes herdados removidos

- infraestrutura e nomenclatura herdadas de “roll” fora do escopo visual;
- leitura da face física como autoridade do resultado;
- `forcedResultMode` e `displayRoll()`;
- `WorldFacade` e estruturas `rollCollectionData`;
- mundos onscreen, offscreen e none paralelos;
- worker OffscreenCanvas;
- builds duplicados minificado/não minificado;
- assets antigos de Ammo.

## Distribuição

O diretório gerado `dist/` permanece versionado porque projetos ERPG consomem o pacote diretamente pelo GitHub e pelo jsDelivr. “Distribuição ESM única” significa um único entrypoint público com chunks lazy, não um único arquivo físico.

O build verifica um orçamento total de 8 MiB e impede que Havok entre no grafo cinemático inicial.

## Documentos relacionados

- [README e início rápido](README.md)
- [Devlog da v2](DEVLOG_V2.md)
- [Changelog](CHANGELOG.md)
- [Migração v1 → v2](docs/MIGRATION_V2.md)
- [Referência da API](docs/API.md)

## Licença e atribuição

O pacote mantém a licença MIT e preserva o aviso de copyright original em [LICENSE](LICENSE).
