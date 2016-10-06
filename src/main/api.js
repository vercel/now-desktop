// Packages
import Now from 'now-client'
import Config from 'electron-config'
import chalk from 'chalk'

// Ours
import {error as showError} from './dialogs'
import logout from './actions/logout'

export function connector(userToken) {
  const config = new Config()
  const token = userToken || config.get('now.user.token')

  if (!token) {
    console.error('No token defined. Not able to load data!')
    return false
  }

  return new Now(token)
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

    const config = new Config()
    const configProperty = 'now.cache.' + name

    config.set(configProperty, freshData)
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

export async function refreshCache(kind, app, tutorial, interval) {
  const session = connector()

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

  const sweepers = []

  const kinds = [
    'deployments',
    'aliases'
  ]

  for (const kind of kinds) {
    const refresher = refreshKind(kind, session)
    sweepers.push(refresher)
  }

  try {
    await Promise.all(sweepers)
  } catch (err) {
    const errorParts = err.split(' ')
    const statusCodeIndex = errorParts.length - 1
    const statusCode = parseInt(errorParts[statusCodeIndex], 10)

    if (statusCode && statusCode === 403) {
      // Stop trying to load data
      stopInterval(interval)

      // If token has been revoked, the server will not respond with data
      // In turn, we need to log out
      await logout(app, tutorial)
    }

    // Stop executing the function
    return
  }

  const currentTime = new Date().toLocaleTimeString()
  console.log(chalk.green(`[${currentTime}]`) + ' Refreshed entire cache')
}
