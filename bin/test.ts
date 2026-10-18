import { expect } from '@t8ngs/expect'
import { assert } from '@t8ngs/assert'
import { snapshot } from '@t8ngs/snapshot'
import { fileSystem } from '@t8ngs/fs'
import { expectTypeOf } from '@t8ngs/expect-type'
import { configure, processCLIArgs, run } from '@t8ngs/runner'

processCLIArgs(process.argv.splice(2))
configure({
  files: ['tests/**/*.spec.ts'],
  plugins: [
    expect(),
    assert(),
    fileSystem({
      basePath: new URL('../tests/tmp', import.meta.url),
    }),
    expectTypeOf(),
    snapshot(),
  ],
})

run()
