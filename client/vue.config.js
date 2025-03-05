const webpack = require('webpack')

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
    config.plugin('html').tap(args => {
      args[0].template = '!!html-loader?minimize=false!' + args[0].template
      args[0].minify = false
      return args
    })
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_DEBUG: JSON.stringify(process.env.NODE_DEBUG)
        }
      })
    ],
    
    
  }
}