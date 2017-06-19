// Native
const os = require('os')

module.exports = `now-desktop node-${process.version} ${os.platform()} (${os.arch()})`
