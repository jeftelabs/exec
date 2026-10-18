# Resolução de módulos e extensões

O `exec` usa os hooks do Node.js e delega a resolução principal a `nextResolve`. Ele não substitui o resolvedor do Node por um resolvedor de TypeScript permissivo. Isso ajuda a manter os imports próximos do comportamento do JavaScript compilado.

## Imports relativos com extensão de saída

Com TypeScript tradicional, o compilador costuma preservar o caminho escrito no import. Se `user.ts` será compilado para `user.js`, escreva:

```ts
import { User } from './user.js'
```

Quando o Node não encontrar esse caminho local e o erro for `ERR_MODULE_NOT_FOUND`, o hook pode tentar a extensão de origem equivalente:

| Specifier escrito | Extensão de origem tentada |
| --- | --- |
| `./user.js` | `./user.ts` e, depois, `./user.tsx` |
| `./user.mjs` | `./user.mts` |
| `./user.cjs` | `./user.cts` |
| `./view.jsx` | `./view.tsx` |

Essa tentativa vale para caminhos locais (`./`, `../`, `/` e `file:`) e só ocorre após falha de resolução do Node. O código também preserva query strings ao tentar a extensão correspondente.

Exemplo:

```text
src/
  index.ts       -> importa ./user.js
  user.ts        -> origem carregada pelo exec
```

## Importar usando extensão TypeScript

O TypeScript oferece `rewriteRelativeImportExtensions` para converter caminhos relativos terminados em `.ts`, `.tsx`, `.mts` ou `.cts` para suas extensões de saída durante a compilação. O `exec` exige que essa opção esteja habilitada para aceitar imports com essas extensões:

```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
```

Então é possível escrever:

```ts
import { User } from './user.ts'
```

Sem a opção, o hook lança um erro indicando que `rewriteRelativeImportExtensions` precisa ser habilitado. Essa verificação também considera a extensão antes de uma query string, por exemplo `./user.ts?v=1`.

## Imports de diretório

Imports de diretório não são expandidos para `index.ts` ou `index.js`:

```ts
// Não suportado como resolução de diretório
import config from './config'

// Use um arquivo explícito
import config from './config/index.js'
```

O erro continua sendo o erro padrão do Node, como `ERR_UNSUPPORTED_DIR_IMPORT` ou `ERR_MODULE_NOT_FOUND`. Essa decisão mantém a resolução previsível e compatível com Node.js.

## Subpath imports

Use o campo `imports` do `package.json` do aplicativo. O Node resolve o alias; o `exec` aplica a tentativa de extensão de origem aos caminhos locais resolvidos quando as condições do hook são atendidas.

Exemplo com destino JavaScript:

```json
{
  "imports": {
    "#services/*": "./build/services/*.js"
  }
}
```

O código-fonte pode usar:

```ts
import { UserService } from '#services/user_service'
```

Também há testes para mapeamentos `imports` cujo destino termina em `.ts`. Prefira destinos compatíveis com a saída compilada para que a mesma configuração funcione em desenvolvimento e produção.

## CommonJS, `.cts` e `require`

O hook transforma módulos que o Node identifica como `module-typescript` ou `commonjs-typescript`. Um arquivo `.cts` carregado por `require` pode, portanto, ser transformado. Para fazer `require('./role.cts')` a partir de TypeScript usando a extensão `.cts`, habilite `rewriteRelativeImportExtensions`.

Não presuma que sintaxe CommonJS estará disponível em `.tsx` ou `.jsx`: esses arquivos são tratados como módulos ES. O comportamento de módulos depende também do formato que o Node atribui ao arquivo e do `package.json` mais próximo.

## JSX e TSX

O loader trata `.tsx` e `.jsx` como módulos ES e transforma JSX com SWC. Configure `compilerOptions.jsx` para habilitar o parser JSX quando um `tsconfig.json` for encontrado. `jsxImportSource` é encaminhado ao runtime automático do SWC, por exemplo `preact`.

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

Sem um `tsconfig.json`, a configuração padrão do pacote habilita parser TSX e runtime JSX automático. Com um `tsconfig.json`, a opção `jsx` controla se o parser aceita JSX.

## Imports JSON e outros formatos

Import attributes são preservados pela transformação, permitindo ao Node carregar JSON, por exemplo:

```ts
import data from './data.json' with { type: 'json' }
```

Arquivos que não correspondem aos formatos TypeScript/JSX tratados pelo loader são delegados ao hook seguinte do Node. O `exec` não transforma JavaScript comum ou JSON.

## Imports dinâmicos, workers e pacotes

- Imports dinâmicos seguem os hooks registrados no processo atual.
- Worker threads usam seus próprios contextos de execução; os testes do projeto confirmam o carregamento de um worker TypeScript criado a partir do processo com o loader ativo.
- Pacotes em `node_modules` que declaram um entrypoint TypeScript também são processados quando o Node os entrega ao hook no formato TypeScript.
- `import.meta.resolve()` continua usando a resolução do Node. O hook pode ajustar o caminho local resolvido de `.js` para `.ts` quando o destino `.js` não existe.

## Resumo do algoritmo de resolução

1. O hook remove temporariamente query strings para verificar a extensão.
2. Se o specifier aponta diretamente para uma extensão TypeScript e a configuração não habilita `rewriteRelativeImportExtensions`, a importação é rejeitada.
3. O Node tenta resolver o specifier original.
4. Se ocorrer `ERR_MODULE_NOT_FOUND` para um caminho local, o hook tenta extensões TypeScript equivalentes para `.js`, `.mjs`, `.cjs` e `.jsx`.
5. Se nenhuma tentativa funcionar, o erro original é propagado.

O algoritmo exato está em [`src/loader.ts`](../../src/loader.ts), e os exemplos executáveis estão em [`tests/loader.spec.ts`](../../tests/loader.spec.ts).
