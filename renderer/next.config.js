const BabiliPlugin = require('babili-webpack-plugin')

module.exports = {
  webpack(config, { dev }) {
    config.target = 'electron-renderer'

    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'UglifyJsPlugin'
    })

    if (!dev) {
      config.plugins.push(new BabiliPlugin())
    }

    return config
  },
  exportPathMap() {
    return {
      '/feed': { page: '/feed' },
      '/about': { page: '/about' },
      '/tutorial': { page: '/tutorial' }
    }
  }
}
