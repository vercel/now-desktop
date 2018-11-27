const env = {
  BUILD_DATE:
    process.env.NODE_ENV === 'production' ? Date.now() : '(not released yet)'
}

module.exports = {
  presets: ['next/babel'],
  plugins: [['transform-define', env]]
}
