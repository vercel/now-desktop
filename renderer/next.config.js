module.exports = {
  webpack(cfg) {
    cfg.target = 'electron-renderer'

    cfg.plugins = cfg.plugins.filter(plugin => {
      if (plugin.constructor.name === 'UglifyJsPlugin') {
        return false
      }

      return true
    })

    return cfg
  }
}
