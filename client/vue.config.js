module.exports = {
  transpileDependencies: ['vuetify'],
  devServer: {
    port: 8000,
    proxy: {
      '^/.+': {
        target: 'http://localhost:8080'
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('html')
      .test(/\.html$/)
      .use('html-loader')
      .loader('html-loader')
      .tap(options => {
        // modify the options...
        return {
          minimize: false
        }
      })
      .end()
  }
}
