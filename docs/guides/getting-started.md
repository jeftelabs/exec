# Instalação e primeiros passos

## Requisitos

- Node.js `>=24.0.0`.
- Um projeto Node.js com arquivos TypeScript.
- ESM recomendado para o pacote e exemplos deste guia. O carregador também trata alguns módulos TypeScript/CommonJS conforme o formato informado pelo Node.js.

## Instalação

Instale o pacote no projeto:

```sh
npm install --save-dev @jeftelabs/exec
```

O `exec` é uma ferramenta de desenvolvimento. Se seu processo de produção executa JavaScript compilado, instale-o como dependência de desenvolvimento e use o build normal para produção.

## Executar um arquivo

Ative o carregador no processo Node com `--import`:

```sh
node --import=@jeftelabs/exec ./src/index.ts
```

Também é possível carregar o entrypoint explicitamente com um caminho resolvido pelo Node:

```sh
node --import ./node_modules/@jeftelabs/exec/build/index.js ./src/index.ts
```

O primeiro formato usa o nome exportado pelo pacote. O segundo pode ser útil para diagnosticar a resolução do pacote.

## Configuração mínima

O carregador procura um `tsconfig.json` a partir do diretório de trabalho do processo. Para usar extensões `.ts` diretamente em imports relativos, habilite `rewriteRelativeImportExtensions`:

```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
```

Sem essa opção, escreva imports relativos com a extensão JavaScript que existirá após a compilação, por exemplo `./user.js` para o arquivo de origem `user.ts`. O carregador consegue tentar a extensão TypeScript correspondente quando o arquivo `.js` não existe.

Para JSX/TSX, configure também o runtime desejado:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

O pacote lê essas opções e as encaminha ao SWC. Consulte [Configuração](../references/configuration.md).

## Importar JSON

Use import attributes de acordo com a sintaxe aceita pela versão do Node.js:

```ts
import config from './config.json' with { type: 'json' }
```

O carregador preserva import attributes durante a transformação TypeScript. A resolução e o carregamento final do JSON continuam a cargo do Node.js.

## Uso em scripts npm

Adicione um script ao `package.json` do seu aplicativo:

```json
{
  "scripts": {
    "dev": "node --import=@jeftelabs/exec ./src/index.ts"
  }
}
```

Depois execute:

```sh
npm run dev
```

## Verificação de tipos e produção

O carregador transforma sintaxe; ele não executa verificação de tipos. Para verificar tipos:

```sh
npx tsc --noEmit
```

Para produção, compile o projeto com o processo de build escolhido e execute os arquivos JavaScript gerados com Node.js. Assim, erros de resolução são detectados no mesmo modelo de módulos que o Node usa em produção.

## Limites importantes

- Imports relativos devem apontar para um arquivo explícito. `./config` e `./config/` não procuram automaticamente `index.ts`.
- Imports relativos com `.ts`, `.tsx`, `.mts` ou `.cts` exigem `rewriteRelativeImportExtensions: true`.
- O carregador não converte automaticamente qualquer import de JavaScript para TypeScript: a tentativa ocorre para os caminhos e erros documentados em [Resolução de módulos](./module-resolution.md).
- `--import` ativa o carregador para o processo Node que o recebe. Processos filhos só o recebem se forem iniciados com a mesma opção ou herdarem `NODE_OPTIONS` configurado para isso.
