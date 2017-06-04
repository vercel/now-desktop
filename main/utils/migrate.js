// Utilities
const logout = require('../utils/logout')
const { getConfig, saveConfig } = require('./config')
const loadData = require('./data/load')
const { API_USER } = require('./data/endpoints')

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
    data = await loadData(API_USER, config.token)
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
