import electron from 'electron'

export default electron.remote

if (typeof document === 'undefined') {
  electron.getGlobal = name => global[name]
  electron.process = process
  electron.require = require

  module.exports = electron
}
