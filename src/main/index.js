// Native
import path from 'path'

// Packages
import {app, Tray, Menu, BrowserWindow, ipcMain} from 'electron'
import ms from 'ms'
import Config from 'electron-config'
import isDev from 'electron-is-dev'
import {dir as isDirectory} from 'path-type'
import fs from 'fs-promise'
import fixPath from 'fix-path'
import log from 'electron-log'
import {resolve as resolvePath} from 'app-root-path'

// Ours
import {innerMenu, outerMenu, deploymentOptions} from './menu'
import {init as initAnalytics} from './analytics'
import {error as showError} from './dialogs'
import deploy from './actions/deploy'
import share from './actions/share'
import autoUpdater from './updates'
import {refreshCache} from './api'
import attachTrayState from './utils/highlight'
import toggleWindow from './utils/toggle-window'
import * as binaryUtils from './utils/binary'

// Log uncaught exceptions to a file
// Locations: megahertz/electron-log
process.on('uncaughtException', log.info)

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null

// Hide dock icon before the app starts
app.dock.hide()

// Define the application name
app.setName('Now')

// Make Now start automatically on login
if (!isDev) {
  app.setLoginItemSettings({
    openAtLogin: true
  })
}

// We need this method in the renderer process
// So that we can load all data after the user has logged in
// And before he opens the context menu
global.refreshCache = refreshCache

// Immediately after login, we'll start the auto updater
// from the renderer process
global.autoUpdater = autoUpdater
global.isDev = isDev

// Share these  between renderer process and the main one
global.errorHandler = showError
global.binaryUtils = binaryUtils

// Make the error handler kill the app
global.appInstance = app

// Makes sure where inheriting the correct path
// Within the bundled app, the path would otherwise be different
fixPath()

// Keep track of the app's busyness for telling
// the autoupdater if it can restart the application
process.env.BUSYNESS = 'ready'

// Make sure that unhandled errors get handled
process.on('uncaughtException', err => {
  console.error(err)
  showError('Unhandled error appeared', err)
})

const config = new Config()

// For starting the refreshment right after login
global.startRefresh = tutorialWindow => {
  const timeSpan = ms('10s')

  // Periodically rebuild local cache every 10 seconds
  const interval = setInterval(async () => {
    if (process.env.CONNECTION === 'offline') {
      return
    }

    await refreshCache(null, app, tutorialWindow, interval)
  }, timeSpan)
}

const onboarding = () => {
  const win = new BrowserWindow({
    width: 650,
    height: 430,
    title: 'Welcome to Now',
    resizable: false,
    center: true,
    frame: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: 'hidden-inset',
    backgroundColor: '#000'
  })

  win.loadURL('file://' + resolvePath('../app/pages/main.html'))
  attachTrayState(win, tray)

  // We need to access it from the "About" window
  // To be able to open it from there
  global.tutorial = win

  const emitTrayClick = aboutWindow => {
    win.hide()

    const emitClick = () => {
      if (aboutWindow && aboutWindow.isVisible()) {
        return
      }

      // Automatically open the context menu
      if (tray) {
        tray.emit('click')
      }

      win.removeListener('hide', emitClick)
    }

    win.on('hide', emitClick)
  }

  win.on('open-tray', emitTrayClick)

  // Just hand it back
  return win
}

const aboutWindow = () => {
  const win = new BrowserWindow({
    width: 360,
    height: 408,
    title: 'About Now',
    resizable: false,
    center: true,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    titleBarStyle: 'hidden-inset',
    frame: false,
    backgroundColor: '#ECECEC'
  })

  win.loadURL('file://' + resolvePath('../app/pages/main.html'))
  attachTrayState(win, tray)

  global.about = win

  return win
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const assignAliases = (aliases, deployment) => {
  if (aliases) {
    const aliasInfo = aliases.find(a => deployment.uid === a.deploymentId)

    if (aliasInfo) {
      deployment.url = aliasInfo.alias
    }
  }

  return deploymentOptions(deployment)
}

// Convert date string from API to valid date object
const toDate = int => new Date(parseInt(int, 10))

const toggleContextMenu = async windows => {
  const deployments = config.get('now.cache.deployments')
  const aliases = config.get('now.cache.aliases')

  const apps = new Map()
  const deploymentList = []

  // Order deployments by date
  deployments.sort((a, b) => toDate(b.created) - toDate(a.created))

  for (const deployment of deployments) {
    const name = deployment.name

    if (apps.has(name)) {
      const existingDeployments = apps.get(name)
      apps.set(name, [...existingDeployments, deployment])

      continue
    }

    apps.set(name, [deployment])
  }

  apps.forEach((deployments, label) => {
    if (deployments.length === 1) {
      deploymentList.push(assignAliases(aliases, deployments[0]))
      return
    }

    deploymentList.push({
      type: 'separator'
    })

    deploymentList.push({
      label,
      enabled: false
    })

    for (const deployment of deployments) {
      deploymentList.push(assignAliases(aliases, deployment))
    }

    deploymentList.push({
      type: 'separator'
    })
  })

  const data = {
    deployments: deploymentList
  }

  let generatedMenu = await innerMenu(app, tray, data, windows)

  if (process.env.CONNECTION === 'offline') {
    const last = generatedMenu.slice(-1)[0]

    generatedMenu = [
      {
        label: 'You\'re offline!',
        enabled: false
      },
      {
        type: 'separator'
      }
    ]

    generatedMenu.push(last)
  }

  const menu = Menu.buildFromTemplate(generatedMenu)
  tray.popUpContextMenu(menu)
}

const isLoggedIn = () => {
  const userProperty = config.has('now.user')
  return userProperty
}

const isDeployable = async directory => {
  const indicators = new Set([
    'package.json',
    'Dockerfile'
  ])

  for (const indicator of indicators) {
    const pathTo = path.join(directory, indicator)
    let stats

    try {
      stats = await fs.lstat(pathTo)
    } catch (err) {}

    if (stats) {
      return true
    }
  }

  return false
}

const fileDropped = async (event, files) => {
  event.preventDefault()

  if (process.env.CONNECTION === 'offline') {
    showError('You\'re offline')
    return
  }

  const loggedIn = isLoggedIn()

  if (!loggedIn) {
    return
  }

  if (files.length > 1) {
    showError('It\'s not yet possible to share multiple files/directories at once.')
    return
  }

  const item = files[0]

  if (!await isDirectory(item) || !await isDeployable(item)) {
    await share(item)
    return
  }

  await deploy(item)
}

app.on('ready', async () => {
  await initAnalytics()

  const onlineStatusWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: false
  })

  onlineStatusWindow.loadURL('file://' + resolvePath('../app/pages/status.html'))

  ipcMain.on('online-status-changed', (event, status) => {
    process.env.CONNECTION = status
  })

  // Start auto updater if not in development mode
  if (!isDev && process.platform !== 'linux') {
    global.autoUpdater(app)
  }

  // DO NOT create the tray icon BEFORE the login status has been checked!
  // Otherwise, the user will start clicking...
  // ...the icon and the app wouldn't know what to do

  // I have no idea why, but path.resolve doesn't work here
  try {
    tray = new Tray(resolvePath('/assets/icons/iconTemplate.png'))

    // Opening the context menu after login should work
    global.tray = tray
  } catch (err) {
    showError('Could not spawn tray item', err)
    return
  }

  const windows = {
    tutorial: onboarding(),
    about: aboutWindow()
  }

  const toggleActivity = event => {
    const loggedIn = isLoggedIn()

    if (loggedIn && !windows.tutorial.isVisible()) {
      tray.setHighlightMode('selection')
      toggleContextMenu(windows)
    } else {
      toggleWindow(event || null, windows.tutorial)
    }
  }

  // Only allow one intance of Now running
  // at the same time
  app.makeSingleInstance(toggleActivity)

  if (isLoggedIn()) {
    // Periodically rebuild local cache every 10 seconds
    global.startRefresh(windows.tutorial)
  }

  if (!isLoggedIn()) {
    // Show the tutorial as soon as the content has finished rendering
    // This avoids a visual flash
    windows.tutorial.on('ready-to-show', () => toggleWindow(null, windows.tutorial))
  }

  // When quitting the app, force close the tutorial and about windows
  app.on('before-quit', () => {
    process.env.FORCE_CLOSE = true
  })

  // Define major event listeners for tray
  tray.on('drop-files', fileDropped)
  tray.on('click', toggleActivity)

  let isHighlighted = false
  let submenuShown = false

  tray.on('right-click', async event => {
    const menu = Menu.buildFromTemplate(outerMenu(app, windows))

    if (!windows.tutorial.isVisible()) {
      isHighlighted = !isHighlighted
      tray.setHighlightMode(isHighlighted ? 'always' : 'never')
    }

    // Toggle submenu
    tray.popUpContextMenu(submenuShown ? null : menu)
    submenuShown = !submenuShown

    event.preventDefault()
  })
})
