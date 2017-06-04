// Native
const os = require('os')

// Ours
const { version } = require('../../package')

module.exports = `now-desktop ${version} node-${process.version} ${os.platform()} (${os.arch()})`
