# Referência de API

## Entry point do pacote

O pacote exporta `build/index.js` por meio do campo `exports` em `package.json`. Esse módulo não exporta funções ou classes para consumo direto. Importá-lo registra o carregador no processo atual:

```sh
node --import=@jeftelabs/exec ./src/index.ts
```

O entrypoint executa estas ações:

1. Ativa source maps do processo com `process.setSourceMapsEnabled(true)`.
2. Chama `initialize()` para carregar o `tsconfig.json` e preparar opções do SWC.
3. Registra `resolve` e `load` usando `registerHooks()` de `node:module`.

Importar o pacote mais de uma vez segue o cache normal de módulos ESM; não há API pública para desregistrar ou reconfigurar os hooks.

## Comportamento dos hooks

### `resolve`

Implementado em `src/loader.ts`. Delega a resolução principal a `nextResolve`, rejeita certos imports explícitos de TypeScript sem `rewriteRelativeImportExtensions` e tenta extensões TypeScript equivalentes para caminhos locais quando um import JavaScript não é encontrado.

### `load`

Implementado em `src/loader.ts`. Transforma formatos `module-typescript` e `commonjs-typescript`, além de caminhos `.tsx` e `.jsx`, usando o transformador interno. Para formatos não tratados, chama `nextLoad` sem alterar o conteúdo.

### `initialize`

Carrega configuração uma única vez. Usa `TS_EXEC_PWD` ou `process.cwd()` como caminho de busca.

Esses nomes são detalhes internos e não fazem parte da API exportada do pacote.

## Módulos internos

| Módulo | Responsabilidade |
| --- | --- |
| `src/loader.ts` | Hooks `resolve` e `load`, seleção de arquivos TypeScript e mensagens de erro. |
| `src/get_config.ts` | Localiza `tsconfig.json` e converte opções compatíveis para SWC. |
| `src/transform.ts` | Encapsula a chamada síncrona de transformação do SWC e define o tipo de módulo. |
| `src/debug.ts` | Cria o logger do namespace `ts-exec` usando `node:util.debuglog`. |

Os módulos internos não são exportados por `package.json` e não devem ser tratados como API estável.
