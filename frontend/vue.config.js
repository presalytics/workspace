module.exports = {
  devServer: {
    disableHostCheck: true,
    proxy: {
      '/api/ooxml': {
        target: process.env.VUE_APP_OOXML_AUTOMATION_HOST,
        pathRewrite: function(path, req) {
          return path.replace(/^(\/api\/ooxml)/,"")
        },
        changeOrigin: true,
        logLevel: 'debug'
      },
      '/api/events': {
        target: process.env.VUE_APP_EVENTS_HOST,
        pathRewrite: function(path, req) {
          return path.replace(/^(\/api\/events)/,"")
        },
        changeOrigin: true,
        logLevel: 'debug'
      },
      '/api/event-store': {
        target: process.env.VUE_APP_EVENT_STORE_HOST,
        pathRewrite: function(path, req) {
          return path.replace(/^(\/api\/event-store)/,"")
        },
        changeOrigin: true,
        logLevel: 'debug'
      },
      '/api': {
        target: process.env.VUE_APP_WORKSPACE_HOST,
        pathRewrite: function(path, req) {
          return path.replace(/^(\/api)/,"")
        },
        changeOrigin: true,
        logLevel: 'debug',
      },
    }
  },
  transpileDependencies: ['vuetify'],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
  configureWebpack: {
    devtool: 'source-map'
  },
  chainWebpack: config => {
    config.devtool('source-map')
    config.module.rule('eslint').use('eslint-loader').options({
      fix: true,
    })

    config.module.rule('js').exclude.add(/\.worker\.js$/)

    config.module
      .rule('worker-loader')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
  },
}
