import { defineConfig } from '@solidjs/start/config';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import Icons from 'unplugin-icons/vite';

/**
 * https://github.com/solidjs/solid-start/issues/1374#issuecomment-2162667748
 */
const VinxiAutoImport = () => {
  const autoimport = AutoImport({
    dts: true,
    packagePresets: ['solid-js', '@solidjs/router'],
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
  });

  return {
    ...autoimport,
    transform(src, id) {
      let _id = id;
      if (_id.startsWith('/')) {
        _id = new URL(`file://${_id}`).pathname;
      }

      return autoimport.transform(src, _id);
    }
  };
};

export default defineConfig({
  vite: {
    // TODO: investigate why this is happening
    // optimizeDeps: {
    //   exclude: ["blowfish-cbc"],
    // },
    //
    // build: {
    //   rollupOptions: {
    //     external: ["blowfish-cbc"],
    //   },
    // },
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
});
