const BabiliPlugin = require('babili-webpack-plugin')

module.exports = {
  webpack(cfg) {
    cfg.target = 'electron-renderer'

    cfg.plugins = cfg.plugins.filter(plugin => {
      return plugin.constructor.name !== 'UglifyJsPlugin'
    })

    cfg.plugins.push(new BabiliPlugin())
    return cfg
  }
}
