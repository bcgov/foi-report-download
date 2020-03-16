module.exports = {
  transpileDependencies: ['vuetify'],
  devServer: {
    port: 8000,
    proxy: {
      '^/.+': {
        target: 'http://localhost:8080'
      }
    }
  }
}
