// Packages
const fetch = require('node-fetch')

// Utilities
const logout = require('../actions/logout')
const { get: getConfig, save: saveConfig } = require('./config')

const NETWORK_ERR_CODE = 'network_error'
const NETWORK_ERR_MESSAGE = 'A network error has occurred. Please retry'
const API_USER = 'api/www/user'

const load = async (path, token) => {
  const headers = {}
  const url = `https://zeit.co/${path}`

  // On login, the token isn't saved to the config yet
  // but we need to make another network request to
  // get all the user details before we can save to config there
  headers.Authorization = `bearer ${token}`

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

const required = ['uid', 'email', 'username']

module.exports = async () => {
  let config

  try {
    config = await getConfig(true)
  } catch (err) {
    return
  }

  // Check if the necessary fields are already there
  // and abort if so
  if (config.user) {
    let allThere = true

    for (const prop of required) {
      if (!config.user[prop]) {
        allThere = false
      }
    }

    if (allThere) {
      console.log('No need to migrate!')
      return
    }
  }

  console.log('Migrating config to new scheme...')
  let data

  try {
    data = await load(API_USER, config.token)
  } catch (err) {
    await logout()
    return
  }

  if (!data.user) {
    await logout()
    return
  }

  const toSave = {}

  for (const prop of required) {
    toSave[prop] = data.user[prop]
  }

  // Update the config
  // Make sure to remove the email field by
  // passing an empty object
  await saveConfig({
    user: toSave,
    email: {}
  })

  console.log('Finished migrating!')
}
