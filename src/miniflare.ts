import { BuildOptions, buildSync } from 'esbuild'
import { Miniflare, MiniflareOptions } from 'miniflare'

type TsMiniflareOptions = MiniflareOptions & {
  esbuild?: BuildOptions,
}

export class TsMiniflare extends Miniflare {
  constructor(opts: TsMiniflareOptions) {
    const defaultOptions: BuildOptions = {
      format: 'esm',
      target: 'esnext',
      bundle: true,
      write: false,
    }

    let result
    if ('script' in opts) {
      // Compile typescript using stdin
      result = buildSync({
        ...defaultOptions,
        stdin: {
          contents: opts.script,
          resolveDir: __dirname,
        },
        ...opts.esbuild,
      })
    } else if ('scriptPath' in opts) {
      // Compile typescript using entrypoint
      result = buildSync({
        ...defaultOptions,
        entryPoints: [opts.scriptPath],
        ...opts.esbuild,
      })
    } else throw new Error('script or scriptPath options is required')

    if (!result.outputFiles || result.outputFiles.length > 1) throw new Error('Invalid output files')
    const script = result.outputFiles[0].text

    super({
      ...opts,
      modules: true,
      script,
      scriptPath: undefined,
    })
  }
}
