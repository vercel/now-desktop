module.exports = {
  webpack(cfg) {
    cfg.target = 'electron-renderer';
    return cfg;
  }
};
