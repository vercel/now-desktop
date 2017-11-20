// Native
const path = require('path')
const { homedir } = require('os')

// Packages
const fs = require('fs-extra')
const pathExists = require('path-exists')
const groom = require('groom')
const deepExtend = require('deep-extend')
const { watch } = require('chokidar')

// Utilities
const loadData = require('./data/load')

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
let oldToken = null

const hasNewConfig = async () => {
  if (!await pathExists(paths.auth)) {
    return false
  }

  if (!await pathExists(paths.config)) {
    return false
  }

  return true
}

exports.getConfig = async () => {
  let content = {}

  if (await hasNewConfig()) {
    const authContent = await fs.readJSON(paths.auth)
    let token

    if (authContent && authContent.credentials) {
      const shAuth = authContent.credentials.find(i => i.provider === 'sh')

      if (shAuth) {
        ;({ token } = shAuth)
      }
    }

    const { sh, updateChannel, desktop } = await fs.readJSON(paths.config)
    const isCanary = updateChannel && updateChannel === 'canary'

    if (isCanary) {
      content.updateChannel = 'canary'
    }

    if (desktop) {
      content.desktop = desktop
    }

    Object.assign(content, sh || {}, token ? { token } : {})
  } else {
    content = await fs.readJSON(paths.old)
  }

  if (!content.token) {
    throw new Error('No user token defined')
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

exports.saveConfig = async (data, type) => {
  let isNew = await hasNewConfig()

  // Ensure that we're writing to the new config
  // destination, if no config exists yet
  if (!isNew && !await pathExists(paths.old)) {
    isNew = true
  }

  const destination = isNew ? paths[type] : paths.old
  let currentContent = {}

  try {
    currentContent = await fs.readJSON(destination)
  } catch (err) {}

  if (type === 'config') {
    // Only create a sub prop for the new config
    if (isNew) {
      // These are top-level properties
      const { updateChannel, desktop } = data

      // Inject the content
      data = { sh: data }

      if (updateChannel) {
        data.updateChannel = updateChannel
        delete data.sh.updateChannel
      }

      if (desktop) {
        data.desktop = desktop
        delete data.sh.desktop
      }
    }

    if (!currentContent._) {
      currentContent._ =
        'This is your Now config file. See `now config help`. More: https://git.io/v5ECz'
      currentContent.updateChannel = 'stable'
    }

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
  } else if (type === 'auth') {
    if (!currentContent._) {
      currentContent._ =
        "This is your Now credentials file. DON'T SHARE! More: https://git.io/v5ECz"
    }

    if (!currentContent.credentials) {
      currentContent.credentials = []
    }

    const { credentials } = currentContent
    const related = credentials.find(item => item.provider === 'sh')
    const index = related ? credentials.indexOf(related) : 0

    credentials[index] = Object.assign(related || {}, data)
  }

  // Create all the directories
  await fs.ensureFile(destination)

  // Update config file
  await fs.writeJSON(destination, currentContent, {
    spaces: 2
  })
}

const configChanged = async (file, logout) => {
  if (!global.windows || !configWatcher) {
    return
  }

  // We use the global `windows` list so that we can
  // call this method from the renderer without having to pass
  // the windows
  const mainWindow = global.windows.main
  const name = path.basename(file)

  let content

  try {
    content = await exports.getConfig()
  } catch (err) {
    logout('config-removed')
    return
  }

  if (name === 'auth.json' && oldToken !== content.token) {
    content.user = false
    console.log('Token has changed')
  }

  oldToken = content.token

  if (
    !content.user ||
    (content.user && Object.keys(content.user).length === 0)
  ) {
    console.log('Re-fetching user information')

    // Re-fetch the user information from our API
    const { user } = await loadData('/api/www/user', content.token)

    content.user = {
      uid: user.uid,
      username: user.username,
      email: user.email
    }

    // Update the config file
    await exports.saveConfig({ user: content.user }, 'config')

    // Let the developer know
    console.log('Done refetching it!')
    return
  }

  mainWindow.webContents.send('config-changed', content)
}

exports.watchConfig = async () => {
  let toWatch = [paths.old]

  if (await hasNewConfig()) {
    toWatch = [paths.auth, paths.config]
  } else if (!await pathExists(paths.old)) {
    return
  }

  // Load this now, because it otherwise doesn't work
  const logout = require('./logout')

  // Start watching the config file and
  // inform the renderer about changes inside it
  configWatcher = watch(toWatch)
  configWatcher.on('change', file => configChanged(file, logout))

  // Log out when a config file is removed
  configWatcher.on('unlink', () => logout('config-removed'))
}
