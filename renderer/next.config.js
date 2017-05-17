const BabiliPlugin = require('babili-webpack-plugin')

module.exports = {
  webpack(config, { dev }) {
    config.target = 'electron-renderer'

    // Hide the "dependency is a critical expression" warnings
    // There's no need to care about them
    config.module.exprContextCritical = false

    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'UglifyJsPlugin'
    })

    if (!dev) {
      config.plugins.push(new BabiliPlugin())
    }

    return config
  }
}
