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
      '/api/story': {
        target: process.env.VUE_APP_STORY_HOST,
        pathRewrite: function(path, req) {
          return path.replace(/^(\/api\/story)/,"")
        },
        changeOrigin: true,
        logLevel: 'debug'
      },
      '/api/workspace': {
        target: process.env.VUE_APP_WORKSPACE_API_URL,
        pathRewrite: function(path, req) {
          return path.replace(/^(\/api\/workspace)/,"")
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
  chainWebpack: config => {

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
