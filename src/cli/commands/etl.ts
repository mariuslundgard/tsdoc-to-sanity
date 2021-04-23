import path from 'path'
import chalk from 'chalk'
import pkgUp from 'pkg-up'
import {extract} from '../../extract'
import {load} from '../../load'
import {transform} from '../../transform'
import {readJSONFile} from '../helpers'

export async function etl(
  inputPath: string,
  opts: {cwd: string; outDir?: string; tsconfigPath?: string}
) {
  const outDir = opts.outDir || '.'
  const tsconfigPath = opts.tsconfigPath || 'tsconfig.json'
  const packageJsonPath = await pkgUp({cwd: opts.cwd})

  if (!packageJsonPath) {
    throw new Error('package.json not found')
  }

  const pkg = await readJSONFile(packageJsonPath)

  if (!pkg.name) {
    throw new Error('package.json is missing name')
  }

  if (!pkg.version) {
    throw new Error('package.json is missing version')
  }

  const packagePath = path.dirname(packageJsonPath)

  const result = await extract(inputPath, {
    packagePath,
    tsconfigPath,
  })

  for (const msg of result.messages) {
    if (msg.logLevel === 'error') {
      console.log(`${chalk.red('error')} ${msg.text}`)
    }

    if (msg.logLevel === 'warning') {
      console.log(`${chalk.yellow('warning')} ${msg.text}`)
    }
  }

  const p = result.apiPackage.name.split('/')
  const packageScope = p.length > 1 ? p[0] : null
  const packageName = p.length > 1 ? p[1] : p[0]

  const docs = transform(result, {
    package: {scope: packageScope, name: packageName, version: pkg.version},
  })

  const jsonPath = path.resolve(packagePath, outDir, `${pkg.version}.json`)

  await load(docs, {fs: {path: jsonPath}})

  console.log(
    `${chalk.green('success')} wrote documents to ${path.relative(packagePath, jsonPath)}`
  )
}
