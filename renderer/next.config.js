const nodeExternals = require('webpack-node-externals');

module.exports = {
  webpack(cfg) {
    if (!cfg.externals) {
      cfg.externals = [nodeExternals()]
    }

    cfg.externals = cfg.externals.concat([
      'electron',
      'electron-config',
      'fs-promise',
      'now-client',
      'child_process',
      'time-ago',
      'path-type'
    ])

    return cfg
  }
}
