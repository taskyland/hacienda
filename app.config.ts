import { defineConfig } from '@solidjs/start/config';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  vite: {
    plugins: [
      AutoImport({
        imports: ['solid-js', '@solidjs/router'],
        resolvers: [
          IconsResolver({
            prefix: 'Icon',
            extension: 'jsx'
          })
        ],
        biomelintrc: {
          enabled: true
        }
      }),
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
});
