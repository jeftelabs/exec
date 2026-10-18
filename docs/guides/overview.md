# Visão geral

`@jeftelabs/exec` é um carregador JIT de TypeScript para Node.js. Ele registra hooks de módulos, transforma arquivos TypeScript durante o carregamento usando SWC e entrega JavaScript ao Node.js sem gerar uma cópia compilada antes de iniciar a aplicação.

## O que ele faz

- Carrega arquivos `.ts`, `.mts`, `.cts` e `.tsx` reconhecidos pelo Node.js como módulos TypeScript.
- Transforma a sintaxe TypeScript com SWC durante o carregamento.
- Processa arquivos `.tsx` e `.jsx` como módulos ES.
- Usa o `tsconfig.json` encontrado no projeto para selecionar opções de transformação.
- Tenta resolver imports locais que apontam para a saída `.js`, `.mjs`, `.cjs` ou `.jsx` quando o arquivo correspondente de origem TypeScript existe.
- Mantém as regras de resolução do Node.js para extensões explícitas, subpath imports e imports de diretório.
- Adiciona source maps inline ao resultado da transformação quando o SWC os produz.

## O que ele não faz

- Não verifica tipos. Para isso, use `npm run typecheck` (ou `tsc`) separadamente.
- Não substitui o compilador de produção. O carregador transforma código durante a execução; a compilação continua sendo responsabilidade do fluxo de build do aplicativo.
- Não implementa resolução de diretórios ou busca automática de `index.ts`.
- Não fornece aliases próprios de importação. Use o campo `imports` do `package.json` e siga as regras de subpath imports do Node.js.
- Não é plugin de `@t8ngs/runner`; esse pacote é usado somente na infraestrutura de testes deste repositório.

## Como funciona em alto nível

1. O processo importa `@jeftelabs/exec` via `node --import`.
2. O entrypoint procura o `tsconfig.json` a partir do diretório de trabalho (ou de `TS_EXEC_PWD`) e prepara opções para o SWC.
3. O pacote registra os hooks síncronos `resolve` e `load` do Node.js.
4. O Node resolve cada specifier usando seu mecanismo normal. Se um import local com extensão JavaScript não for encontrado, o hook pode tentar a extensão TypeScript equivalente.
5. Quando o Node carrega um módulo TypeScript ou um `.tsx`/`.jsx`, o hook lê a fonte, pede ao SWC que a transforme e devolve JavaScript ao Node.

Os detalhes e as condições de cada passo estão em [Arquitetura](../architecture.md) e [Resolução de módulos](./module-resolution.md).

## Compatibilidade e requisitos

- Node.js `>=24.0.0`, conforme `engines` em `package.json`.
- Pacote ESM.
- A API pública é o efeito colateral de importar o pacote. Não há função exportada para chamar.
- `tsx` requer configuração JSX compatível no `tsconfig.json`, por exemplo `"jsx": "react-jsx"`.

Veja [Instalação e primeiros passos](./getting-started.md) para ativação e exemplos.
