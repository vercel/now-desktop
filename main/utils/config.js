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
  config: '.now/config.json'
}

for (const file in paths) {
  if (!{}.hasOwnProperty.call(paths, file)) {
    continue
  }

  paths[file] = path.join(homedir(), paths[file])
}

let configWatcher = null
let oldToken = null

const hasConfig = async () => {
  if (!await pathExists(paths.auth)) {
    return false
  }

  if (!await pathExists(paths.config)) {
    return false
  }

  return true
}

exports.getConfig = async () => {
  const content = {}
  let authContent = null
  let config = null

  try {
    authContent = await fs.readJSON(paths.auth)
    config = await fs.readJSON(paths.config)
  } catch (e) {}

  let token = null

  if (authContent) {
    if (authContent.credentials) {
      ;({ token } = authContent.credentials.find(
        item => item.provider === 'sh'
      ))
    } else {
      token = authContent.token
    }
  }

  const tokenProp = token ? { token } : {}

  if (config && config.sh) {
    const { sh, updateChannel, desktop } = config
    const isCanary = updateChannel && updateChannel === 'canary'

    if (isCanary) {
      content.updateChannel = 'canary'
    }

    if (desktop) {
      content.desktop = desktop
    }

    Object.assign(content, sh || {}, tokenProp)
  } else {
    Object.assign(content, config || {}, tokenProp)
  }

  if (typeof content.user === 'object') {
    content.user = content.user.uid || content.user.id
  }

  if (typeof content.currentTeam === 'object') {
    content.currentTeam = content.currentTeam.id
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

  const toRemove = ['currentTeam', 'user', 'sh']

  const configContent = await fs.readJSON(paths.config)

  for (const item of toRemove) {
    delete configContent[item]
  }

  await fs.writeJSON(paths.config, configContent, {
    spaces: 2
  })

  const authContent = await fs.readJSON(paths.auth)
  const comment = authContent._ ? `${authContent._}` : null

  if (comment) {
    authContent._ = comment
  }

  await fs.writeJSON(paths.auth, authContent, {
    spaces: 2
  })
}

exports.saveConfig = async (data, type) => {
  const destination = paths[type]
  let currentContent = {}

  try {
    currentContent = await fs.readJSON(destination)
  } catch (err) {}

  if (type === 'config') {
    let existingShownTips = currentContent.shownTips

    if (currentContent.sh) {
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

      if (currentContent.sh.shownTips) {
        existingShownTips = currentContent.sh.shownTips
      }
    }

    if (existingShownTips) {
      // Make sure tips don't show up again if they
      // were hidden with the old config
      data = deepExtend(data, {
        desktop: {
          shownTips: existingShownTips
        }
      })

      delete currentContent.shownTips

      if (currentContent.sh) {
        delete currentContent.sh.shownTips
      }
    }

    if (
      typeof currentContent.user === 'string' ||
      typeof currentContent.currentTeam === 'string'
    ) {
      if (typeof data.user === 'object') {
        data.user = data.user.uid || data.user.id
      }

      if (typeof data.currentTeam === 'object') {
        data.currentTeam = data.currentTeam.id
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

    if (currentContent.credentials) {
      const { credentials } = currentContent
      const related = credentials.find(item => item.provider === 'sh')
      const index = related ? credentials.indexOf(related) : 0

      credentials[index] = Object.assign(related || {}, data)
    } else {
      Object.assign(currentContent, data)
    }
  }

  // Create all the directories
  await fs.ensureFile(destination)

  // Update config file
  await fs.writeJSON(destination, currentContent, {
    spaces: 2
  })
}

const configChanged = async file => {
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
    console.error(err)
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
    console.log('Done refetching it')
    return
  }

  mainWindow.webContents.send('config-changed', content)
}

exports.watchConfig = async () => {
  const toWatch = [paths.auth, paths.config]

  if (!await hasConfig()) {
    return
  }

  // Load this now, because it otherwise doesn't work
  const logout = require('./logout')

  // Start watching the config file and
  // inform the renderer about changes inside it
  configWatcher = watch(toWatch)
  configWatcher.on('change', file => configChanged(file))

  // Log out when a config file is removed
  configWatcher.on('unlink', async file => {
    let exists = null

    // Be sure we get a path passed
    if (!file) {
      return
    }

    // Be extra sure that it was removed, so that we
    // don't log out people for no reason
    try {
      exists = await pathExists(file)
    } catch (err) {
      console.error(err)
      return
    }

    if (exists) {
      return
    }

    logout('config-removed')
  })
}
