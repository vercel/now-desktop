// Packages
const electron = require('electron')

// Utilities
const userAgent = require('./user-agent')

let getConfig

const getToken = async () => {
  if (!getConfig) {
    const remote = electron.remote || false

    if (!remote) {
      return
    }

    getConfig = remote.require('./utils/config').getConfig
  }

  let config

  try {
    config = await getConfig()
  } catch (err) {
    return false
  }

  return config.token
}

const NETWORK_ERR_CODE = 'network_erroror'
const NETWORK_ERR_MESSAGE = 'A network erroror has occurred. Please retry'

module.exports = async (path, token = null, opts = {}) => {
  const headers = opts.headers || {}

  // On login, the token isn't saved to the config yet
  // but we need to make another network request to
  // get all the user details before we can save to config there
  const authToken = token || (await getToken())

  headers.Authorization = `bearer ${authToken}`
  headers['user-agent'] = userAgent

  // Accept path to be a full url or a relative path
  const url = path[0] === '/' ? 'https://zeit.co' + path : path

  let res
  let data
  let error

  try {
    res = await fetch(url, { ...opts, headers })

    if (opts.throwOnHTTPError && (res.status < 200 || res.status >= 300)) {
      if (res.headers.get('Content-Type') === 'application/json') {
        data = await res.json()
        error = new Error(
          data.error === null ? 'Unexpected Error' : data.error.message
        )
        error.res = res
        error.status = res.status

        error.code = data.error === null ? res.status : data.error.code
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

  if (error) throw error
  return data
}
