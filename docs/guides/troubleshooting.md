# Solução de problemas

## `Cannot import "...ts" using ".ts" extension`

O código importou explicitamente uma extensão TypeScript, mas a configuração carregada não habilita `compilerOptions.rewriteRelativeImportExtensions`.

Habilite a opção no `tsconfig.json` encontrado pelo loader:

```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
```

Em monorepos, confira se o loader está lendo o tsconfig esperado. Defina `TS_EXEC_PWD` antes de iniciar o processo para alterar o caminho de busca.

## `ERR_MODULE_NOT_FOUND` ao importar um arquivo

Confira se o caminho é explícito e se a extensão corresponde ao arquivo de saída. Por exemplo, para `user.ts`, use `./user.js` quando esse for o nome do arquivo compilado. O loader tenta `.ts` após falha de `.js` em caminhos locais, mas não tenta resolver qualquer nome ou diretório.

Use `NODE_DEBUG=ts-exec` para observar as tentativas de resolução.

## `ERR_UNSUPPORTED_DIR_IMPORT`

O import aponta para um diretório. O `exec` não procura `index.ts` automaticamente. Importe um arquivo explícito, como `./config/index.js`.

## JSX/TSX não é reconhecido

Quando existe `tsconfig.json`, configure `compilerOptions.jsx`, por exemplo `react-jsx`. Se utilizar runtime JSX automático que não seja React, configure também `jsxImportSource`.

Sem `tsconfig.json`, o pacote habilita parser TSX nos defaults, mas isso não configura os tipos nem as dependências do runtime para o projeto.

## O `tsconfig.json` errado está sendo usado

O loader procura a configuração a partir de `process.cwd()` ao importar o pacote. Execute o processo a partir do diretório esperado ou defina `TS_EXEC_PWD` antes do comando. O loader só lê a configuração na inicialização; reinicie o processo após mudanças.

## Erro ou sintaxe não suportada pelo SWC

O `exec` não é um verificador de tipos e não implementa todas as funções do compilador TypeScript. Execute `npx tsc --noEmit` para verificar tipos. Para sintaxe de transformação, confira a mensagem do SWC e a configuração efetivamente encaminhada em [`configuration.md`](../references/configuration.md).

## Comportamento diferente em `require`

O Node determina se um arquivo é ESM ou CommonJS com base na extensão e no contexto do pacote. Arquivos `.tsx` e `.jsx` são tratados como ESM pelo loader. Para `require` de TypeScript com extensão explícita, habilite `rewriteRelativeImportExtensions` quando aplicável.

## Processo filho não reconhece TypeScript

O loader é registrado no processo que recebe `--import`. Ao iniciar subprocessos, workers ou comandos filhos, verifique se eles também recebem o preload apropriado. O teste de worker do projeto demonstra um caso coberto, mas outros mecanismos de criação de processo podem exigir configuração própria.

## Investigar com os testes

Execute a suíte do pacote:

```sh
npm test
```

Ou rode apenas os testes já buildados:

```sh
npm run quick:test
```

`quick:test` não compila o pacote antes de executar. Se o código mudou, rode `npm run build` antes ou prefira `npm test`.
