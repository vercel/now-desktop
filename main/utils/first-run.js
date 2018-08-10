const Store = require('electron-store')

const getStore = opts => {
  opts = Object.assign({ defaults: { firstRun: true } }, opts)

  return new Store(opts)
}

const firstRun = opts => {
  const conf = getStore(opts)
  let firstRun

  if (firstRun === undefined) {
    firstRun = conf.get('firstRun')
  }

  if (firstRun === true) {
    conf.set('firstRun', false)
  }

  return firstRun
}

const clear = opts => {
  getStore(opts).set('firstRun', true)
}

module.exports = firstRun
module.exports.clear = clear
