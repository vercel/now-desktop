// Packages
const Now = require('now-client')
const Cache = require('electron-config')
const chalk = require('chalk')
const isDev = require('electron-is-dev')
const ms = require('ms')

// Utilities
const { get: getConfig } = require('./utils/config')

const getToken = async () => {
  let config

  try {
    config = await getConfig()
  } catch (err) {
    return false
  }

  return config.token
}

exports.connector = async () => {
  const token = await getToken()

  if (!token) {
    return false
  }

  return new Now(token)
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

    const cache = exports.prepareCache()

    // If the response doesn't contain any data, remove the
    // entry from the cache
    if (Array.isArray(freshData) && freshData.length === 0) {
      if (cache.has(name)) {
        cache.delete(name)
      }

      resolve()
      return
    }

    // Save fresh data to cache
    cache.set(name, freshData)
    resolve()
  })
}

exports.refreshCache = async kind => {
  const session = await exports.connector()

  if (!session) {
    require('./actions/logout')()
    return
  }

  if (kind) {
    await refreshKind(kind, session)
    return
  }

  const kinds = new Set(['deployments', 'aliases'])

  for (const kind of kinds) {
    try {
      await refreshKind(kind, session)
    } catch (err) {
      const errorParts = err.split(' ')
      const statusCode = parseInt(errorParts[1], 10)

      if (statusCode && statusCode === 403) {
        // If token has been revoked, the server will not respond with data
        // In turn, we need to log out
        require('./actions/logout')()
      }

      // Stop executing the function
      return
    }
  }

  const currentTime = new Date().toLocaleTimeString()
  console.log(chalk.green(`[${currentTime}]`) + ' Refreshed entire cache')
}

exports.isLoggedIn = async () => {
  if (await getToken()) {
    return true
  }

  return false
}

exports.startRefreshing = async () => {
  const timer = time => {
    return setTimeout(async () => {
      if (process.env.CONNECTION === 'offline') {
        timer(ms('10s'))
        return
      }

      try {
        await exports.refreshCache()
      } catch (err) {
        console.log(err)
      }

      timer(ms('10s'))
    }, time)
  }

  // Refresh cache once in the beginning
  timer(100)
}
