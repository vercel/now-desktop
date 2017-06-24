// Native
const path = require('path')
const { homedir } = require('os')

// Packages
const fs = require('fs-extra')
const pathExists = require('path-exists')
const groom = require('groom')
const deepExtend = require('deep-extend')
const { watch } = require('chokidar')

const file = path.join(homedir(), '.now.json')
const exists = () => pathExists(file)

let configWatcher = null

exports.getConfig = async onlyCheckToken => {
  if (!await exists()) {
    throw new Error("Could retrieve config file, it doesn't exist")
  }

  const content = await fs.readJSON(file)

  if (!content.token) {
    throw new Error('No token contained inside config file')
  }

  if (!onlyCheckToken && !content.user) {
    throw new Error('No user contained inside config file')
  }

  return content
}

exports.removeConfig = async () => {
  // Stop watching the config file
  if (configWatcher) {
    configWatcher.close()

    // Reset the watcher state back to none
    configWatcher = null
  }

  await fs.remove(file)
}

exports.saveConfig = async data => {
  let currentContent = {}

  try {
    currentContent = await fs.readJSON(file)
  } catch (err) {}

  // Merge new data with the existing
  currentContent = deepExtend(currentContent, data)

  // Remove all the data that should be removed (like `null` props)
  currentContent = groom(currentContent)

  // And ensure that empty objects are also gone
  for (const newProp in data) {
    if (!{}.hasOwnProperty.call(data, newProp)) {
      continue
    }

    const propContent = currentContent[newProp]
    const isObject = typeof propContent === 'object'

    // Ensure that there are no empty objects inside the config
    if (isObject && Object.keys(propContent).length === 0) {
      delete currentContent[newProp]
    }
  }

  // Update config file
  await fs.writeJSON(file, currentContent, {
    spaces: 2
  })
}

const configChanged = async logout => {
  if (!global.windows) {
    return
  }

  // We use the global `windows` list so that we can
  // call this method from the renderer without having to pass
  // the windows
  const mainWindow = global.windows.main

  let content

  try {
    content = await exports.getConfig()
  } catch (err) {
    logout()
    return
  }

  mainWindow.webContents.send('config-changed', content)
}

exports.watchConfig = async () => {
  if (!await exists()) {
    return
  }

  // Load this now, because it otherwise doesn't work
  const logout = require('./logout')

  // Start watching the config file and
  // inform the renderer about changes inside it
  configWatcher = watch(file)
  configWatcher.on('change', () => configChanged(logout))

  // Log out when config file is removed
  configWatcher.on('unlink', logout)
}
