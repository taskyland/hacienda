import { defineConfig } from '@solidjs/start/config'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import type { Plugin } from 'vinxi/dist/types/lib/vite-dev'

/**
 * https://github.com/solidjs/solid-start/issues/1374#issuecomment-2162667748
 */
const VinxiAutoImport = (): Plugin => {
  const autoimport = AutoImport({
    dts: './.vinxi/imports.d.ts',
    packagePresets: ['solid-js', '@solidjs/router'],
    imports: ['solid-js', '@solidjs/router', 'vitest'],
    resolvers: [
      IconsResolver({
        prefix: 'Icon',
        extension: 'jsx'
      })
    ],
    biomelintrc: {
      enabled: true,
      filepath: './.vinxi/biome.json'
    }
  })

  return {
    ...autoimport,
    transform(src, id) {
      let _id = id
      if (_id.startsWith('/')) {
        _id = new URL(`file://${_id}`).pathname
      }

      return autoimport.transform(src, _id)
    }
  }
}

export default defineConfig({
  server: {
    esbuild: { options: { target: 'esnext' } }
  },
  vite: {
    optimizeDeps: {
      exclude: ['blowfish-cbc']
    },
    plugins: [
      VinxiAutoImport(),
      Icons({
        compiler: 'solid',
        autoInstall: true
      })
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  }
})
