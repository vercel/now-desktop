// Packages
const electron = require('electron')
const isDev = require('electron-is-dev')
const fixPath = require('fix-path')
const prepareNext = require('electron-next')
const { resolve: resolvePath } = require('app-root-path')
const squirrelStartup = require('electron-squirrel-startup')
const Sentry = require('@sentry/electron')

// Utilities
const pkg = require('../package')
const firstRun = require('./utils/first-run')
const { innerMenu, outerMenu } = require('./menu')
const { error: showError } = require('./dialogs')
const deploy = require('./utils/deploy')
const autoUpdater = require('./updates')
const toggleWindow = require('./utils/frames/toggle')
const windowList = require('./utils/frames/list')
const { getConfig, watchConfig } = require('./utils/config')
const { exception: handleException } = require('./utils/error')

// In development, we do not want to report errors
if (!isDev) {
  Sentry.init({
    dsn: 'https://d07ceda63dd8414e9c403388cfbd18fe@sentry.io/1323140',
    environment: pkg.version.includes('canary') ? 'canary' : 'stable',
    release: `now-desktop@${pkg.version}`
  })
}

// Immediately quit the app if squirrel is launching it
if (squirrelStartup) {
  electron.app.quit()
}

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null

// Prevent having to check for login status when opening the window
let loggedIn = null

// Check status once in the beginning when the app starting up
// And then every 2 seconds
// We could to this on click on the tray icon, but we
// don't want to block that action
const setLoggedInStatus = async () => {
  let token

  try {
    ;({ token } = await getConfig())
  } catch (err) {}

  loggedIn = Boolean(token)
  setTimeout(setLoggedInStatus, 2000)
}
setLoggedInStatus()

// Load the app instance from electron
const { app } = electron

// Set the application's name
app.setName('Now')

const reportAndHandle = async err => {
  if (isDev) {
    return
  }

  Sentry.captureException(err)

  const client = Sentry.getCurrentHub().getClient()

  if (client) {
    // Block execution until the error is sent. This ensures
    // we only relaunch the app once the error was reported to ZEIT.
    await client.close()
  }

  handleException()
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', reportAndHandle)

// Hide dock icon before the app starts
// This is only required for development because
// we're setting a property on the bundled app
// in production, which prevents the icon from flickering
if (isDev && process.platform === 'darwin') {
  app.dock.hide()
}

const isFirstRun = firstRun()

// Make Now start automatically on login
if (!isDev && isFirstRun) {
  app.setLoginItemSettings({
    openAtLogin: true
  })
}

// Makes sure where inheriting the correct path
// Within the bundled app, the path would otherwise be different
fixPath()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const contextMenu = async (windows, inRenderer) => {
  if (process.env.CONNECTION === 'offline') {
    return outerMenu(app, windows)
  }

  return innerMenu(app, tray, windows, inRenderer)
}

const filesDropped = async (event, files) => {
  event.preventDefault()

  if (process.env.CONNECTION === 'offline') {
    showError("You're offline")
    return
  }

  if (!loggedIn) {
    return
  }

  await deploy(files)
}

// Chrome Command Line Switches
app.commandLine.appendSwitch('disable-renderer-backgrounding')

app.on('ready', async () => {
  let config = {}

  try {
    config = await getConfig()
  } catch (err) {
    config = {}
  }

  const onlineStatusWindow = new electron.BrowserWindow({
    width: 0,
    height: 0,
    show: false
  })

  onlineStatusWindow.loadURL(
    'file://' + resolvePath('./main/static/pages/status.html')
  )

  electron.ipcMain.on('online-status-changed', (event, status) => {
    process.env.CONNECTION = status
  })

  // DO NOT create the tray icon BEFORE the login status has been checked!
  // Otherwise, the user will start clicking...
  // ...the icon and the app wouldn't know what to do

  // I have no idea why, but path.resolve doesn't work here
  try {
    const iconName =
      process.platform === 'win32'
        ? 'iconWhite'
        : process.platform === 'linux' ? 'iconWhite' : 'iconTemplate'
    tray = new electron.Tray(resolvePath(`./main/static/tray/${iconName}.png`))
  } catch (err) {
    handleException(err)
    return
  }

  // Opening the context menu after login should work
  global.tray = tray

  // Ensure that `next` works with `electron`
  try {
    await prepareNext('./renderer')
  } catch (e) {
    // Next has failed to start but context menu should still work
  }

  // Extract each window out of the list
  const { mainWindow, tutorialWindow, aboutWindow } = windowList

  // And then put it back into a list :D
  const windows = {
    main: mainWindow(tray),
    tutorial: tutorialWindow(tray),
    about: aboutWindow(tray)
  }

  // Provide application and the CLI with automatic updates
  autoUpdater(windows.main)

  // Make the window instances accessible from everywhere
  global.windows = windows

  // Listen to changes inside .now.json
  // This needs to be called AFTER setting global.windows
  await watchConfig()

  electron.ipcMain.on('open-menu', async (event, bounds) => {
    if (bounds && bounds.x && bounds.y) {
      bounds.x = parseInt(bounds.x.toFixed(), 10) + bounds.width / 2
      bounds.y = parseInt(bounds.y.toFixed(), 10) - bounds.height / 2

      const menu = await contextMenu(windows, true)

      menu.popup({
        x: bounds.x,
        y: bounds.y
      })
    }
  })

  if (process.platform === 'darwin') {
    electron.systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => {
        const darkMode = electron.systemPreferences.isDarkMode()

        windows.main.send('theme-changed', { darkMode })
        windows.about.send('theme-changed', { darkMode })
      }
    )
  }

  const toggleActivity = async event => {
    if (loggedIn) {
      toggleWindow(event || null, windows.main, tray)
      return
    }

    toggleWindow(event || null, windows.tutorial)
  }

  // Only allow one instance of Now running
  // at the same time
  const gotInstanceLock = app.requestSingleInstanceLock()

  if (!gotInstanceLock) {
    // We're using `exit` because `quit` didn't work
    // on Windows (tested by matheus)
    return app.exit()
  }

  app.on('second-instance', toggleActivity)

  const { wasOpenedAtLogin } = app.getLoginItemSettings()
  const afterUpdate = config.desktop && config.desktop.updatedFrom

  if (isFirstRun) {
    // Show the tutorial as soon as the content has finished rendering
    // This avoids a visual flash
    if (!wasOpenedAtLogin && !afterUpdate) {
      windows.tutorial.once('ready-to-show', toggleActivity)
    }
  } else {
    const mainWindow = windows.main

    if (!mainWindow.isVisible() && !wasOpenedAtLogin && !afterUpdate) {
      mainWindow.once('ready-to-show', toggleActivity)
    }
  }

  // Linux requires setContextMenu to be called in order for the context menu to populate correctly
  if (process.platform === 'linux') {
    tray.setContextMenu(
      loggedIn ? await contextMenu(windows) : outerMenu(app, windows)
    )
  }

  // Define major event listeners for tray
  tray.on('drop-files', filesDropped)
  tray.on('click', toggleActivity)
  tray.on('double-click', toggleActivity)

  let submenuShown = false

  tray.on('right-click', async event => {
    if (windows.main.isVisible()) {
      windows.main.hide()
      return
    }

    const menu = loggedIn ? await contextMenu(windows) : outerMenu(app, windows)

    // Toggle submenu
    tray.popUpContextMenu(submenuShown ? null : menu)
    submenuShown = !submenuShown

    event.preventDefault()
  })
})
