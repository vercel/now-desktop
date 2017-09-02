// Native
const path = require('path')
const { homedir } = require('os')

// Packages
const fs = require('fs-extra')
const pathExists = require('path-exists')
const groom = require('groom')
const deepExtend = require('deep-extend')
const { watch } = require('chokidar')

const paths = {
  auth: '.now/auth.json',
  config: '.now/config.json',
  old: '.now.json'
}

for (const file in paths) {
  if (!{}.hasOwnProperty.call(paths, file)) {
    continue
  }

  paths[file] = path.join(homedir(), paths[file])
}

let configWatcher = null

const hasNewConfig = async () => {
  if (!await pathExists(paths.auth)) {
    return false
  }

  if (!await pathExists(paths.config)) {
    return false
  }

  return true
}

exports.getConfig = async noCheck => {
  let content = {}

  if (await hasNewConfig()) {
    const { credentials } = await fs.readJSON(paths.auth)
    const { token } = credentials.find(item => item.provider === 'sh')
    const { sh } = await fs.readJSON(paths.config)

    Object.assign(content, sh, { token })
  } else {
    content = await fs.readJSON(paths.old)
  }

  if (!noCheck && !content.token) {
    throw new Error('No token contained inside config file')
  }

  if (!noCheck && !content.user) {
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

  if (await hasNewConfig()) {
    const configContent = await fs.readJSON(paths.config)
    delete configContent.sh

    await fs.writeJSON(paths.config, configContent, {
      spaces: 2
    })

    const authContent = await fs.readJSON(paths.auth)
    const { credentials } = authContent
    const related = credentials.find(item => item.provider === 'sh')
    const index = credentials.indexOf(related)

    credentials.splice(index, 1)
    authContent.credentials = credentials

    await fs.writeJSON(paths.auth, authContent, {
      spaces: 2
    })

    return
  }

  await fs.remove(paths.old)
}

exports.saveConfig = async data => {
  let currentContent = {}

  try {
    currentContent = await fs.readJSON(paths.old)
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
  await fs.writeJSON(paths.old, currentContent, {
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
  if (!await pathExists(paths.old)) {
    return
  }

  // Load this now, because it otherwise doesn't work
  const logout = require('./logout')

  // Start watching the config file and
  // inform the renderer about changes inside it
  configWatcher = watch(paths.old)
  configWatcher.on('change', () => configChanged(logout))

  // Log out when config file is removed
  configWatcher.on('unlink', logout)
}
