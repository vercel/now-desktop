// Packages
const Now = require('now-client')
const Cache = require('electron-config')
const chalk = require('chalk')
const isDev = require('electron-is-dev')

// Utilities
const { error: showError } = require('./dialogs')
const { get: getConfig } = require('./utils/config')

exports.connector = async () => {
  let config

  try {
    config = await getConfig()
  } catch (err) {
    return false
  }

  return new Now(config.token)
}

exports.prepareCache = () => {
  const name = isDev ? 'now-cache' : 'cache'
  return new Cache({ name })
}

const refreshKind = async (name, session) => {
  let method

  switch (name) {
    case 'deployments':
      method = 'getDeployments'
      break
    case 'aliases':
      method = 'getAliases'
      break
    default:
      method = false
  }

  if (!method) {
    console.error(`Not able to refresh ${name} cache`)
    return
  }

  return new Promise(async (resolve, reject) => {
    let freshData

    try {
      freshData = await session[method]()
    } catch (err) {
      reject(err)
      return
    }

    // Save fresh data to cache
    const cache = exports.prepareCache()
    cache.set(name, freshData)

    resolve()
  })
}

const stopInterval = interval => {
  if (!interval) {
    return
  }

  console.log('Stopping the refreshing process...')
  clearInterval(interval)
}

exports.refreshCache = async (kind, app, tutorial, interval) => {
  const session = await exports.connector()

  if (!session) {
    stopInterval(interval)
    return
  }

  if (kind) {
    try {
      await refreshKind(kind, session)
    } catch (err) {
      showError('Not able to refresh ' + kind, err)
      stopInterval(interval)
    }

    return
  }

  const sweepers = new Set()
  const kinds = new Set(['deployments', 'aliases'])

  for (const kind of kinds) {
    const refresher = refreshKind(kind, session)
    sweepers.add(refresher)
  }

  try {
    await Promise.all(sweepers)
  } catch (err) {
    const errorParts = err.split(' ')
    const statusCode = parseInt(errorParts[1], 10)

    if (statusCode && statusCode === 403) {
      // Stop trying to load data
      stopInterval(interval)

      // If token has been revoked, the server will not respond with data
      // In turn, we need to log out
      const logout = require('./actions/logout')
      await logout(app, tutorial)
    }

    // Stop executing the function
    return
  }

  const currentTime = new Date().toLocaleTimeString()
  console.log(chalk.green(`[${currentTime}]`) + ' Refreshed entire cache')
}
