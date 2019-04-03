module.exports = {
  webpack(config) {
    config.target = 'web';

    // Hide the "dependency is a critical expression" warnings
    // There's no need to care about them
    config.module.exprContextCritical = false;

    // Prevent huge sourcemaps from being created,
    // makes the devtools much faster
    config.devtool = false;

    config.plugins = config.plugins.filter(plugin => {
      return plugin.constructor.name !== 'UglifyJsPlugin';
    });

    // Make `react-dom/server` work
    if (config.resolve.alias) {
      delete config.resolve.alias.react;
      delete config.resolve.alias['react-dom'];
    }

    config.externals = [];

    return config;
  },
  exportPathMap() {
    return {
      '/feed': { page: '/feed' }
    };
  }
};
