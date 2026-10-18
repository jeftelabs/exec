<div align="center">

# 🚀 @jeftelabs/exec

Um compilador JIT para executar código TypeScript e JavaScript no Node.js sem etapa de compilação, construído sobre o SWC com suporte completo a ESM para Node.js 24 e versões superiores.

[![gh-workflow-image]][gh-workflow-url] [![npm-image]][npm-url] ![][typescript-image] [![license-image]][license-url]

</div>

<br />

---

## 🎯 Visão geral

`exec` é um motor de execução de TypeScript que permite rodar arquivos `.ts` e `.tsx` diretamente no Node.js sem uma etapa de build. **Diferente de outras soluções populares, o `exec` prioriza a compatibilidade com a resolução de módulos do Node.js, garantindo que o código executado com o `exec` funcione de forma idêntica após ser compilado para JavaScript**.

<br />

## 💡 Por que o `exec` existe

Soluções existentes como `ts-node` e `tsx` serviram bem à comunidade, mas trazem compromissos significativos que podem causar problemas em produção.

O `ts-node` não é mais mantido ativamente e ficou pesado com o tempo. Embora o `tsx` ofereça uma alternativa moderna, ele faz uma concessão crítica: permite imports sem extensão e imports de diretórios durante o desenvolvimento. Isso cria uma desconexão perigosa. Seu código roda perfeitamente em desenvolvimento, mas quebra em produção quando compilado para JavaScript, porque o Node.js exige estritamente extensões de arquivo explícitas e não consegue resolver imports de diretórios.

O `exec` adota uma abordagem diferente. Ele oferece o conjunto completo de recursos do TypeScript (incluindo enums, decorators legados e sintaxe JSX) seguindo estritamente as regras de resolução de arquivos do Node.js. Isso significa que todo import que funciona com o `exec` vai funcionar após a compilação, eliminando uma classe inteira de falhas de deploy em produção.

<br />

## ✨ Recursos

<table>
<tr>
<td>

🎨 **Suporte completo ao TypeScript**  
Enums, decorators legados, imports de namespace e sintaxe JSX

</td>
<td>

🛡️ **Imports seguros para produção**  
Impõe a resolução de módulos do Node.js

</td>
</tr>
<tr>
<td>

📦 **Feito para ESM**  
Suporte de primeira classe a módulos ECMAScript

</td>
<td>

⚡ **Base moderna**  
Construído sobre o SWC para compilação rápida

</td>
</tr>
<tr>
<td>

🪶 **Leve**  
Menos de 200 linhas, inspirado no [Amaro](https://github.com/nodejs/amaro)

</td>
<td>

⚙️ **Zero configuração**  
Sem arquivos de config personalizados, lê o `tsconfig.json` automaticamente

</td>
</tr>
<tr>
<td>

✅ **Confiança no desenvolvimento**  
Código que roda com o `exec` vai rodar após a compilação

</td>
</tr>
</table>

<br />

## 📚 Documentação

Consulte a [documentação completa](./docs/README.md) para guias de instalação e uso, resolução de módulos, configuração, arquitetura, desenvolvimento, testes e solução de problemas.

<br />

## 📦 Instalação

```bash
npm i -D @jeftelabs/exec
```

<br />

## 🚦 Uso

### Execução básica

Rode qualquer arquivo TypeScript diretamente.

```bash
node --import=@jeftelabs/exec ./src/index.ts
```

### Uso programático

Use o `exec` dentro da sua aplicação Node.js.

```ts
import '@jeftelabs/exec'

// Agora você pode importar arquivos TypeScript
const module = await import('./meu-arquivo-typescript.ts')
```

<br />

## 📝 Imports com a extensão `.ts`

O TypeScript tomou, deliberadamente, a decisão de manter os caminhos de import inalterados durante a compilação. Quando você escreve um import em TypeScript, ele permanece exatamente o mesmo na saída JavaScript compilada. Essa escolha de design significa que você deve referenciar a extensão de arquivo que vai existir após a compilação, e não a extensão TypeScript atual.

Por exemplo, ao importar um arquivo TypeScript, você escreve o import com a extensão `.js` porque é isso que vai existir após a compilação.

```ts
export class UserService {
  // implementação
}
```

```ts
// Referencie com .js, mesmo que o arquivo seja user_service.ts
import { UserService } from '../services/user_service.js'
```

Após a compilação, ambos os arquivos viram `.js`, e o caminho de import funciona perfeitamente com o Node.js sem nenhuma modificação.

Recentemente, o time do TypeScript introduziu a opção de compilador `rewriteRelativeImportExtensions`, que permite usar extensões `.ts` nos seus imports. Quando ativada, o TypeScript reescreve as extensões `.ts` para `.js` durante a compilação.

Se você prefere usar extensões `.ts` nos seus imports, ative essa opção no seu `tsconfig.json`.

```json
{
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true
  }
}
```

Com essa configuração, você pode escrever imports usando extensões `.ts`.

```ts
// Agora você pode usar a extensão .ts
import { UserService } from '../services/user_service.ts'
```

O TypeScript vai reescrever isso automaticamente para `.js` durante a compilação, e o `exec` vai lidar com isso corretamente durante o desenvolvimento.

<br />

### Aliases de subpath imports

Aliases de subpath imports são definidos no seu arquivo `package.json`, que permanece inalterado durante o processo de compilação do TypeScript. Como o `package.json` é usado diretamente pelo Node.js em tempo de execução e nunca é reescrito pelo compilador do TypeScript, os caminhos definidos nos seus aliases devem referenciar as extensões da saída compilada.

Isso significa que seus aliases de subpath devem sempre usar extensões `.js`, mesmo quando os arquivos de origem são `.ts`. O `package.json` será o mesmo tanto em desenvolvimento (com o `exec`) quanto em produção (com o JavaScript compilado), então os caminhos precisam funcionar para a saída compilada.

```json
{
  "name": "meu-app",
  "imports": {
    "#controllers/*": "./build/controllers/*.js",
    "#services/*": "./build/services/*.js",
    "#models/*": "./build/models/*.js"
  }
}
```

Com esses aliases definidos, você pode usá-los nos seus arquivos de origem TypeScript.

```ts
import { UsersController } from '#controllers/users_controller'
import { UserService } from '#services/user_service'
import { User } from '#models/user'
```

Essa abordagem funciona perfeitamente tanto com o `exec` durante o desenvolvimento quanto com o Node.js após a compilação. Os aliases resolvem corretamente em ambos os ambientes porque o `package.json` permanece inalterado e o Node.js o usa diretamente para a resolução de módulos.

Se você tem o `rewriteRelativeImportExtensions` ativado na sua configuração do TypeScript, isso não afeta os aliases de subpath imports. A reescrita se aplica apenas a imports relativos (os que começam com `./` ou `../`), não a bare specifiers ou subpath imports.

<br />

### Arquivos carregados usando `require`

Arquivos TypeScript carregados usando `require` (por exemplo, via `createRequire`) também são compilados pelo `exec`, então enums e decorators funcionam dentro deles. As mesmas regras de resolução de arquivos se aplicam a eles. Você precisa ativar a opção de compilador `rewriteRelativeImportExtensions` para fazer `require` de um arquivo usando sua extensão TypeScript.

```ts
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

// Precisa de "rewriteRelativeImportExtensions"
const { Role } = require('./role.cts')
```

Os arquivos `.jsx` e `.tsx` são sempre compilados como módulos ES, inclusive quando carregados usando `require`. Portanto, eles não podem usar `module.exports` ou outros globais do CommonJS.

<br />

## 🤔 Por que não o tsx?

Se você usa `tsx` atualmente, pode se perguntar por que trocar. A resposta depende das suas prioridades.

O `tsx` é excelente e rápido, mas permite padrões que vão falhar em produção. Considere este cenário comum:

<table>
<tr>
<th>❌ Funciona com tsx (quebra após a compilação)</th>
<th>✅ Funciona com exec (funciona após a compilação)</th>
</tr>
<tr>
<td>

```ts
// Import sem extensão
import { User } from './models/user'

// Import de diretório
import config from './config'

// Após a compilação:
// Error: Cannot find module
```

</td>
<td>

```ts
// Extensão explícita
import { User } from './models/user.ts'

// Arquivo explícito
import config from './config/index.ts'

// Após a compilação:
// Funciona de forma idêntica ✨
```

</td>
</tr>
</table>

Além disso, o `tsx` não suporta decorators legados, dos quais muitos projetos ainda dependem. O `exec` oferece suporte completo a decorators, tornando-o compatível com frameworks e bibliotecas que ainda não migraram para a nova especificação de decorators.

<br />

## 📊 Comparação

| Recurso                              | exec | tsx | ts-node | Node.js (nativo) |
| ------------------------------------ | :--: | :-: | :-----: | :--------------: |
| **Manutenção ativa**                 |  ✅  | ✅  |   ❌    |        ✅        |
| **Construído sobre o SWC**           |  ✅  | ❌  |   ⚠️    |        ✅        |
| **Decorators legados**               |  ✅  | ❌  |   ✅    |        ❌        |
| **Imports compatíveis com Node.js**  |  ✅  | ❌  |   ✅    |        ✅        |
| **ESM-first**                        |  ✅  | ✅  |   ⚠️    |        ✅        |
| **Recursos completos do TypeScript** |  ✅  | ⚠️  |   ✅    |        ❌        |
| **Respeita o tsconfig.json**         |  ✅  | ✅  |   ✅    |        ❌        |
| **Leve**                             |  ✅  | ✅  |   ❌    |        ✅        |

<br />

---

<div align="center">

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma [issue](https://github.com/jeftelabs/exec/issues) ou um pull request.

<br />

## 📄 Licença

@jeftelabs/exec é um software de código aberto licenciado sob a [licença MIT](LICENSE).

</div>

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/jeftelabs/exec/checks.yml?style=for-the-badge
[gh-workflow-url]: https://github.com/jeftelabs/exec/actions/workflows/checks.yml 'Github action'
[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"
[npm-image]: https://img.shields.io/npm/v/@jeftelabs/exec.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@jeftelabs/exec 'npm'
[license-image]: https://img.shields.io/npm/l/@jeftelabs/exec?color=blueviolet&style=for-the-badge
[license-url]: LICENSE 'license'
