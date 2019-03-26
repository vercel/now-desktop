const electron = require('electron')
const isDev = require('electron-is-dev')
const fixPath = require('fix-path')
const prepareNext = require('electron-next')
const { resolve: resolvePath } = require('app-root-path')
const squirrelStartup = require('electron-squirrel-startup')
const Sentry = require('@sentry/electron')
const { sentryDsn } = require('../package.json')
const firstRun = require('./utils/first-run')
const { innerMenu, outerMenu } = require('./menu')
const autoUpdater = require('./updates')
const toggleWindow = require('./utils/frames/toggle')
const windowList = require('./utils/frames/list')
const { exception: handleException } = require('./utils/error')

Sentry.init({
  dsn: sentryDsn
})

// Immediately quit the app if squirrel is launching it
if (squirrelStartup) {
  electron.app.quit()
}

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null

// Load the app instance from electron
const { app } = electron

// Set the application's name
app.setName('Now')

// Handle uncaught exceptions
process.on('uncaughtException', handleException)

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

// Chrome Command Line Switches
app.commandLine.appendSwitch('disable-renderer-backgrounding')

app.on('ready', async () => {
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
  const { mainWindow } = windowList

  // And then put it back into a list :D
  const windows = {
    main: mainWindow(tray)
  }

  // Provide application and the CLI with automatic updates
  autoUpdater(windows.main)

  // Make the window instances accessible from everywhere
  global.windows = windows

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
    toggleWindow(event || null, windows.main, tray)
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

  if (isFirstRun) {
    // Show the tutorial as soon as the content has finished rendering
    // This avoids a visual flash
    if (!wasOpenedAtLogin) {
      windows.tutorial.once('ready-to-show', toggleActivity)
    }
  } else {
    const mainWindow = windows.main

    if (!mainWindow.isVisible() && !wasOpenedAtLogin) {
      mainWindow.once('ready-to-show', toggleActivity)
    }
  }

  // Linux requires setContextMenu to be called in order for the context menu to populate correctly
  if (process.platform === 'linux') {
    tray.setContextMenu(await contextMenu(windows))
  }

  // Define major event listeners for tray
  tray.on('click', toggleActivity)
  tray.on('double-click', toggleActivity)

  let submenuShown = false

  tray.on('right-click', async event => {
    if (windows.main.isVisible()) {
      windows.main.hide()
      return
    }

    const menu = await contextMenu(windows)

    // Toggle submenu
    tray.popUpContextMenu(submenuShown ? null : menu)
    submenuShown = !submenuShown

    event.preventDefault()
  })
})
