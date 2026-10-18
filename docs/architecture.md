# Arquitetura

## Estrutura

```text
index.ts                 entrypoint e registro dos hooks
src/loader.ts            resolução e carregamento de módulos
src/get_config.ts        leitura do tsconfig e configuração do SWC
src/transform.ts         transformação de fonte pelo SWC
src/debug.ts             logs de diagnóstico
tests/                   testes unitários e de integração
bin/test.ts              configuração e execução da suíte
```

## Ciclo de vida

### Inicialização

`index.ts` habilita source maps, chama `initialize()` e registra hooks síncronos do Node.js via `registerHooks()`. `initialize()` usa `TS_EXEC_PWD` ou `process.cwd()` para localizar um `tsconfig.json`. O resultado é guardado em variáveis de módulo; não há leitura por arquivo a cada import.

### Resolução

O hook `resolve` recebe o specifier e o contexto do Node. Primeiro remove a query string apenas para identificar extensões. Se o specifier termina em uma extensão TypeScript e o tsconfig não habilita `rewriteRelativeImportExtensions`, lança um erro claro. Em seguida delega ao `nextResolve`.

Se a resolução falhar com `ERR_MODULE_NOT_FOUND` e o caminho for local, tenta uma extensão TypeScript equivalente para `.js`, `.mjs`, `.cjs` ou `.jsx`. Não faz busca de diretório, não acrescenta extensões arbitrárias e propaga o erro se as tentativas falharem.

### Carregamento e transformação

O hook `load` transforma módulos que o Node identifica como `module-typescript` ou `commonjs-typescript`, além de arquivos `.tsx` e `.jsx`. Ele solicita o conteúdo ao próximo hook em formato de módulo, transforma com `transformSync`, adiciona source map inline se disponível e devolve o formato apropriado ao Node.

O formato de saída de `.tsx`/`.jsx` é ES module. Para TypeScript comum, o sufixo `-typescript` é removido do formato informado pelo Node, preservando assim a distinção entre ESM e CommonJS quando o Node já a determinou.

### Tradução de configuração

`getConfig()` usa `get-tsconfig` e converte opções selecionadas para as opções do SWC. Se não encontrar configuração, retorna defaults definidos no pacote. Veja [Configuração](./references/configuration.md) para a lista e os valores.

## Erros de transformação

O SWC pode reportar erros com códigos próprios. O loader converte `UnsupportedSyntax` em `UnsupportedSyntaxError` e `InvalidSyntax` em `SyntaxError`, acrescentando arquivo, linha e trecho de código. Outros erros são relançados como `Error` com a mensagem do SWC.

## Logs e source maps

O logger usa `debuglog('ts-exec')`, ativável pelo mecanismo `NODE_DEBUG` do Node. O entrypoint habilita source maps no processo; o loader também anexa um source map em data URL quando o SWC retorna um.

## Decisões de projeto

- **Node resolve primeiro:** mantém as regras de extensão e package imports do Node como base.
- **Extensões explícitas:** evita que imports de desenvolvimento dependam de resolução de diretórios que não existirá após o build.
- **Mapeamento limitado de `.js` para `.ts`:** apoia o fluxo em que o código TypeScript já usa a extensão que terá em produção.
- **SWC síncrono:** acompanha os hooks síncronos registrados pelo pacote.
- **Configuração por projeto:** o `tsconfig.json` do aplicativo controla opções relevantes de transformação.

## Pontos de manutenção

- Ajustes de extensão e fallback pertencem a `resolve` e devem ser cobertos por testes de integração que iniciam um processo Node separado.
- Alterações na conversão de opções pertencem a `get_config.ts` e devem atualizar `tests/get_config.spec.ts` e a referência de configuração.
- Alterações na API de inicialização ou no entrypoint devem atualizar a referência de API e o README principal.
- Compatibilidade com hooks e formatos TypeScript deve ser avaliada para a versão mínima do Node definida em `package.json`.
