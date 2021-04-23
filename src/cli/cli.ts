import chalk from 'chalk'
import {etl} from './commands/etl'
import {getCLIContext} from './helpers'

async function runCli() {
  const {args, cmd, cwd, flags} = getCLIContext()

  if (!cmd) {
    throw new Error('missing command')
  }

  if (cmd === 'etl') {
    const inputPath = args[0]

    if (typeof inputPath !== 'string') {
      throw new Error('missing input')
    }

    await etl(inputPath, {
      cwd,
      outDir: typeof flags.outDir === 'string' ? flags.outDir : undefined,
      tsconfigPath: typeof flags.tsconfig === 'string' ? flags.tsconfig : undefined,
    })
  } else {
    throw new Error(`unknown command: ${cmd}`)
  }
}

runCli().catch((err) => {
  console.error(`${chalk.red('error')} ${err.message}`)
  process.exit(1)
})
