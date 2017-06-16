module.exports = {
  webpack(config) {
    config.target = 'electron-renderer'

    // Hide the "dependency is a critical expression" warnings
    // There's no need to care about them
    config.module.exprContextCritical = false

    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'UglifyJsPlugin'
    })

    return config
  },
  exportPathMap() {
    return {
      '/feed': { page: '/feed' },
      '/tutorial': { page: '/tutorial' },
      '/about': { page: '/about' }
    }
  }
}
