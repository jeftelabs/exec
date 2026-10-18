# Referência de configuração

O `exec` procura o `tsconfig.json` mais próximo do caminho de busca e deriva uma configuração do SWC a partir das opções TypeScript que conhece. Ele não executa o compilador TypeScript e não valida os tipos da aplicação.

## Localização do `tsconfig.json`

Por padrão, a busca começa em `process.cwd()`. Para escolher outro caminho de busca, defina `TS_EXEC_PWD` antes de iniciar o processo:

```sh
TS_EXEC_PWD=./apps/api node --import=@jeftelabs/exec ./apps/api/src/index.ts
```

O pacote usa `get-tsconfig`, que procura a configuração aplicável subindo a partir do caminho informado. Em monorepos, escolha um caminho dentro do pacote cuja configuração deve ser usada.

`TS_EXEC_PWD` é lido ao importar o pacote, durante `initialize()`. Alterá-lo depois que o loader foi registrado não recalcula a configuração.

## Opções TypeScript encaminhadas ao SWC

| Opção TypeScript | Efeito no loader |
| --- | --- |
| `target` | Define o target do SWC. O target `ES6` é convertido para `esnext`; se ausente, usa `esnext`. |
| `sourceMap` | Controla `sourceMaps` do SWC; o padrão é `true`. |
| `baseUrl` | É encaminhado como `jsc.baseUrl` do SWC. |
| `jsx` | Habilita o parser JSX/TSX quando definido; determina a transformação JSX. |
| `jsxImportSource` | Define o import source do runtime JSX automático. |
| `experimentalDecorators` | Habilita a transformação de decorators legados. |
| `emitDecoratorMetadata` | Habilita emissão de metadados de decorators. |
| `verbatimModuleSyntax` | É encaminhado para manter a semântica de imports/exports verbatim. |
| `useDefineForClassFields` | É encaminhado para controlar a semântica de campos de classe. |
| `rewriteRelativeImportExtensions` | Controla a permissão de imports relativos com extensões TypeScript; usado também pelo hook de resolução. |

Opções não listadas não devem ser presumidas como suportadas pelo SWC. Confirme o mapeamento atual em [`src/get_config.ts`](../../src/get_config.ts).

## Exemplo de `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rewriteRelativeImportExtensions": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

`module` e `moduleResolution` pertencem ao TypeScript e não mudam o formato de saída do loader: a transformação do SWC para a entrada do Node é configurada como módulo ES. O formato CommonJS é usado quando o Node informa que um arquivo TypeScript foi carregado como CommonJS.

## Configuração padrão sem `tsconfig.json`

Se nenhum `tsconfig.json` for encontrado, o pacote usa valores internos. Entre eles:

- target `esnext` e módulos ES;
- source maps habilitados;
- parser TypeScript com JSX/TSX habilitado;
- decorators legados e metadados habilitados;
- runtime JSX automático;
- `useDefineForClassFields` e `verbatimModuleSyntax` habilitados;
- preservação de import attributes.

Essa configuração padrão serve para execução, não substitui o `tsconfig.json` necessário para verificação de tipos e build do aplicativo.

## Limitação: sem recarga de configuração

A configuração é carregada uma vez no `initialize()`, quando o pacote é importado. O loader não observa alterações no `tsconfig.json` e não oferece API pública para recarregar opções durante o processo.

## Diagnóstico

Para inspecionar as etapas de configuração e resolução, execute com o namespace de debug usado pelo pacote:

```sh
NODE_DEBUG=ts-exec node --import=@jeftelabs/exec ./src/index.ts
```

O log pode incluir caminhos locais do projeto e detalhes de configuração. Evite compartilhar saídas sem revisar informações privadas.
