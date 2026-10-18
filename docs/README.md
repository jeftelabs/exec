# Documentação do `@jeftelabs/exec`

Esta documentação descreve como instalar, utilizar, configurar e desenvolver o carregador JIT `@jeftelabs/exec`. Ela foi escrita a partir do código e dos testes do repositório.

## Para quem usa o pacote

- [Visão geral e conceitos](./guides/overview.md): o que o pacote faz, o que não faz e como os componentes se relacionam.
- [Instalação e primeiros passos](./guides/getting-started.md): requisitos, instalação e formas de ativar o carregador.
- [Resolução de módulos e extensões](./guides/module-resolution.md): imports relativos, subpath imports, TypeScript, JSX e casos não suportados.
- [Configuração](./references/configuration.md): como o `tsconfig.json` influencia a transformação pelo SWC.
- [Solução de problemas](./guides/troubleshooting.md): erros comuns e formas de investigá-los.

## Para quem desenvolve o pacote

- [Arquitetura](./architecture.md): fluxo dos hooks, transformação e limites entre Node.js e SWC.
- [Desenvolvimento, testes e publicação](./guides/development.md): ambiente local, scripts npm, testes e workflows do GitHub Actions.
- [Referência de API](./references/api.md): entrypoint, efeitos de importação e módulos internos.

## Fontes e convenções

- O [README principal](../README.md) é a introdução e referência rápida para quem usa o pacote.
- O [`AGENTS.md`](../AGENTS.md) contém as instruções compartilhadas para agentes de IA.
- O [`CLAUDE.md`](../CLAUDE.md) complementa as instruções de agentes e aponta para este índice.
- O código em `index.ts` e `src/`, o `package.json` e os testes em `tests/` são as fontes de verdade quando uma descrição divergir do comportamento atual.
- Exemplos desta documentação presumem Node.js `>=24.0.0`, ESM e os comandos do `package.json` atual.

Ao mudar comportamento público, requisitos, configuração ou processo de desenvolvimento, atualize também a página correspondente e este índice se novos documentos forem criados.
