module.exports = {
  devServer: {
    disableHostCheck: true,
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
