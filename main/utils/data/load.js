// Packages
const fetch = require('node-fetch')
const ms = require('ms')

// Utilities
const userAgent = require('../user-agent')

const NETWORK_ERR_CODE = 'network_error'
const NETWORK_ERR_MESSAGE = 'A network error has occurred. Please retry'

module.exports = async (path, token) => {
  const headers = {}
  const url = `https://zeit.co/${path}`

  headers.Authorization = `bearer ${token}`
  headers['user-agent'] = userAgent

  let res
  let data
  let error

  try {
    res = await fetch(url, {
      headers,
      timeout: ms('20s')
    })

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
        throw new Error('A network error occured')
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
