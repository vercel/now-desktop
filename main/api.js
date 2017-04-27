// Native
const queryString = require('querystring')

// Packages
const Now = require('now-client')
const Cache = require('electron-config')
const chalk = require('chalk')
const isDev = require('electron-is-dev')
const fetch = require('node-fetch')

// Utilities
const { error: showError } = require('./dialogs')
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
  return new Now(token)
}

exports.prepareCache = () => {
  const name = isDev ? 'now-cache' : 'cache'
  return new Cache({ name })
}

const NETWORK_ERR_CODE = 'network_error'
const NETWORK_ERR_MESSAGE = 'A network error has occurred. Please retry'

const endpoints = {
  events: '/api/www/user/events',
  teams: '/api/teams'
}

const fetchData = async path => {
  const headers = {}
  const url = `https://zeit.co/${path}`
  const token = await getToken()

  if (token) {
    headers.Authorization = `bearer ${token}`
  }

  let res
  let data
  let error

  try {
    res = await fetch(url, { headers })
    if (res.status < 200 || res.status >= 300) {
      if (res.headers.get('Content-Type') === 'application/json') {
        data = await res.json()

        // Remove this hack https://github.com/zeit/front/issues/553
        error = new Error(data.message ? data.message : data.error.message)
        error.res = res
        error.status = res.status

        // Remove this hack https://github.com/zeit/front/issues/553
        error.code = data.error ? data.error.code : res.status
      } else {
        // Handle it below as network error
        throw new Error()
      }
    } else {
      data = await res.json()
    }
  } catch (err) {
    error = new Error(NETWORK_ERR_MESSAGE + ` (${url})`)
    error.code = NETWORK_ERR_CODE
    error.res = null
    error.status = null
  }

  if (error) {
    throw error
  }

  return data
}

const refreshKind = async (name, session, team) => {
  const endpoint = endpoints[name]
  let method

  if (!endpoint) {
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
  }

  return new Promise(async (resolve, reject) => {
    let action

    if (endpoint) {
      const query = {
        limit: 15
      }

      if (team) {
        query.teamId = team.id
      }

      const params = queryString.stringify(query)
      action = fetchData(endpoint + ('?' + params))
    } else {
      action = session[method]()
    }

    let freshData

    try {
      freshData = await action
    } catch (err) {
      reject(err)
      return
    }

    const data = endpoint ? freshData[name] : freshData
    const cache = exports.prepareCache()

    // If the response doesn't contain any data, remove the
    // entry from the cache
    if (Array.isArray(data) && data.length === 0) {
      if (cache.has(name)) {
        cache.delete(name)
      }

      resolve()
      return
    }

    let toSave = endpoint ? freshData[name] : freshData

    if (name === 'events') {
      if (team) {
        const data = toSave

        toSave = {}
        toSave[team.slug] = data
      } else {
        let config

        try {
          config = await getConfig()
        } catch (err) {}

        if (config && config.user) {
          const data = toSave

          toSave = {}
          toSave[config.user.username] = data
        }
      }

      if (cache.has('events')) {
        const cachedEvents = cache.get('events')
        toSave = Object.assign({}, cachedEvents, toSave)
      }
    }

    // Save fresh data to cache
    cache.set(name, toSave)

    if (name === 'teams') {
      for (const teamItem of toSave) {
        await refreshKind('events', null, teamItem)
      }
    }

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

exports.refreshCache = async (kind, app, windows, interval) => {
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

  const kinds = new Set(['deployments', 'aliases', 'teams', 'events'])

  for (const kind of kinds) {
    try {
      await refreshKind(kind, session)
    } catch (err) {
      const errorParts = err.split(' ')
      const statusCode = parseInt(errorParts[1], 10)

      if (statusCode && statusCode === 403) {
        // Stop trying to load data
        stopInterval(interval)

        // If token has been revoked, the server will not respond with data
        // In turn, we need to log out
        const logout = require('./actions/logout')
        await logout(app, windows)
      }

      // Stop executing the function
      return
    }
  }

  const currentTime = new Date().toLocaleTimeString()
  console.log(chalk.green(`[${currentTime}]`) + ' Refreshed entire cache')
}
