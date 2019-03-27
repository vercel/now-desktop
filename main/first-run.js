const Store = require('electron-store')

const getStore = opts => {
  opts = Object.assign({ defaults: { firstRun: true } }, opts)

  return new Store(opts)
}

const firstRun = opts => {
  const conf = getStore(opts)
  const isFirstRun = conf.get('firstRun')

  if (isFirstRun === true) {
    conf.set('firstRun', false)
  }

  return isFirstRun
}

const clear = opts => {
  getStore(opts).set('firstRun', true)
}

module.exports = firstRun
module.exports.clear = clear
