module.exports = {
  transpileDependencies: ['vuetify'],
  devServer: { port: 8000, proxy: 'http://localhost:8080' }
}
