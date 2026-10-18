# Desenvolvimento, testes e publicação

## Preparar o ambiente

1. Use Node.js `>=24.0.0`.
2. Clone o repositório.
3. Instale as dependências travadas pelo lockfile:

   ```sh
   npm ci
   ```

4. Confirme os scripts em `package.json` antes de executar tarefas que alterem arquivos.

O `prepare` do projeto executa Husky para configurar hooks Git localmente.

## Scripts npm

| Script | O que executa |
| --- | --- |
| `npm run lint` | `eslint .`. |
| `npm run format` | `prettier --write .`; modifica arquivos. |
| `npm run typecheck` | `tsc --noEmit`, usando o `tsconfig.json` do pacote. |
| `npm run quick:test` | Inicia `bin/test.ts` com `node --enable-source-maps`. |
| `npm test` | O lifecycle `pretest` executa lint e build; em seguida `c8` executa `quick:test`. |
| `npm run compile` | O lifecycle `precompile` executa lint; o script chama `tsup-node` e emite declarações TypeScript. |
| `npm run build` | Chama `npm run compile`. |
| `npm run release` | Não está definido no `package.json` atual. O release automatizado é tratado pelo workflow GitHub. |

Os testes de integração criam projetos temporários em `tests/tmp` e iniciam subprocessos Node com o loader compilado em `build/index.js`. Não edite fixtures geradas durante uma execução sem confirmar o estado do Git.

## Organização dos testes

- `tests/get_config.spec.ts`: localização do tsconfig e tradução das opções para SWC.
- `tests/loader.spec.ts`: imports, extensões, aliases, JSX, JSON, CommonJS, workers, source maps e erros.
- `tests/helpers.ts`: utilitário para capturar stdout/stderr e status de subprocessos.
- `bin/test.ts`: configura o `@t8ngs/runner`, plugins de assertions, filesystem e snapshots.

Ao corrigir comportamento de resolução, prefira um teste de integração com um processo Node isolado para validar os hooks reais. Ao alterar a configuração, atualize snapshots e casos de `get_config.spec.ts`.

## Workflows do GitHub Actions

Os arquivos em `.github/workflows/` atualmente definem:

- `checks.yml`: executa validação de Conventional Commits em pushes para `main`. Apesar do nome, este workflow não executa os testes ou o lint do pacote.
- `release.yml`: em push para `main`, usa Release Please para preparar releases; quando um release é criado, instala dependências, faz build e anexa o pacote `.tgz` à release.
- `deploy.yml`: em publicação de release, faz build e publica o pacote em GitHub Packages e npm.
- `labels.yml`: sincroniza labels manualmente por `workflow_dispatch`.
- `stale.yml`: marca issues e pull requests inativos e fecha-os após os prazos configurados.

Os workflows de publicação dependem de secrets do repositório. Não tente publicar a partir de uma alteração local sem autorização e credenciais configuradas.

## Release e publicação

O workflow `release.yml` é acionado por push para `main` e usa Release Please. Quando há uma release publicada, `deploy.yml` usa Node 24, instala com `npm ci`, executa `npm run build` e publica nos registries configurados.

O `package.json` também configura `prepublishOnly` para executar o build antes da publicação local via npm. Antes de uma release, verifique:

- versão, changelog/release e Conventional Commits;
- arquivos incluídos pelo campo `files` (`build`, com exclusões declaradas);
- resultado do build e declarações emitidas;
- disponibilidade e escopo dos tokens exigidos pelos workflows.

Não faça commit, push, release ou publicação sem solicitação explícita.

## Convenções Git

- Use Conventional Commits; a configuração está em `commitlint.config.js`.
- O hook `.husky/pre-commit` executa `npm test`.
- O projeto configura Commitizen para auxiliar na criação de mensagens.
- Não faça commit ou push automaticamente durante uma tarefa, a menos que o usuário peça.
