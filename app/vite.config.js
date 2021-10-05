import { defineConfig, loadEnv  } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import eslintPlugin from 'vite-plugin-eslint'
import Components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import { ViteAliases } from 'vite-aliases'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import Inspect from 'vite-plugin-inspect'

export default (({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())}

  return defineConfig({
    plugins: [
      Inspect(),
      eslintPlugin({cache: false}),
      ViteAliases(),
      viteCommonjs({include: ['chartist']}),
      Components({
        dts: true,
        transformer: 'vue2',
        customComponentResolvers: [
          VuetifyResolver(),
          (name) => {
            if (name.startsWith("BaseMaterial")) {
              return {importname: name.replace("BaseMaterial", ""), path: '@/components/base' }
            }
          }
        ],
        include: [/.vue$/, /.vue?vue/, /.md$/],
      }),
      createVuePlugin(),
    ],
    define: {
      'process.env': {},
      'process.platform': null,
      'process.version': null,
    },
    optimizeDeps: {
      include: [
        'normalizr',
        '@microsoft/signalr/dist/webworker/signalr.js',
        'cloudevents',
        'dexie',
      ]
    },
    resolve: { 
      dedupe: ['vue'] 
    },
    server: {
      port: 8080,
      proxy: {
        '/api/ooxml/': {
          target: process.env.VITE_APP_OOXML_AUTOMATION_HOST,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^(\/api\/ooxml)/,"/"),
          logLevel: 'debug',
        },
        '/api/events/': {
          target: process.env.VITE_APP_EVENTS_HOST,
          rewrite: (path) => path.replace(/^(\/api\/events)/,"/"),
          changeOrigin: true,
          ws: true,
          logLevel: 'debug',
        },
        '/api/event-store/': {
          target: process.env.VITE_APP_EVENT_STORE_HOST,
          rewrite: (path) => path.replace(/^(\/api\/event-store)/,"/"),
          changeOrigin: true,
          logLevel: 'debug',
        },
        '/api': {
          target: process.env.VITE_APP_WORKSPACE_HOST,
          rewrite: (path) => path.replace(/^(\/api)/,"/"),
          changeOrigin: true,
          logLevel: 'debug',
        },
      },
    }
  })
})
