import { BuildOptions, buildSync } from 'esbuild'
import { Miniflare, MiniflareOptions } from 'miniflare'
export class TsMiniflare extends Miniflare {
  constructor(opts: MiniflareOptions) {
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
      })
    } else if ('scriptPath' in opts) {
      // Compile typescript using entrypoint
      result = buildSync({
        ...defaultOptions,
        entryPoints: [opts.scriptPath],
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
