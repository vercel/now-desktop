// Packages
const electron = require('electron')
const isDev = require('electron-is-dev')
const fixPath = require('fix-path')
const prepareNext = require('electron-next')
const { resolve: resolvePath } = require('app-root-path')
const firstRun = require('first-run')
const { moveToApplications } = require('electron-lets-move')
const squirrelStartup = require('electron-squirrel-startup')

// Utilities
const { innerMenu, outerMenu } = require('./menu')
const { error: showError } = require('./dialogs')
const deploy = require('./utils/deploy')
const autoUpdater = require('./updates')
const toggleWindow = require('./utils/frames/toggle')
const windowList = require('./utils/frames/list')
const migrate = require('./utils/migrate')
const { getConfig, saveConfig, watchConfig } = require('./utils/config')
const handleException = require('./utils/exception')

// Immediately quit the app if squirrel is launching it
if (squirrelStartup) {
  electron.app.quit()
}

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null

// Prevent having to check for login status when opening the window
let loggedIn = null

const setLoggedInStatus = async () => {
  let config

  try {
    config = await getConfig()
  } catch (err) {
    loggedIn = false
    return
  }

  if (config.token) {
    loggedIn = true
    return
  }

  loggedIn = false
}

// Check status once in the beginning when the app starting up
// And then every 2 seconds
// We could to this on click on the tray icon, but we
// don't want to block that action
setLoggedInStatus()
setInterval(setLoggedInStatus, 2000)

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

// Make Now start automatically on login
if (!isDev && firstRun()) {
  app.setLoginItemSettings({
    openAtLogin: true
  })
}

// Makes sure where inheriting the correct path
// Within the bundled app, the path would otherwise be different
fixPath()

// Keep track of the app's busyness for telling
// the autoupdater if it can restart the application
process.env.BUSYNESS = 'ready'

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const contextMenu = async windows => {
  let generatedMenu = await innerMenu(app, tray, windows)

  if (process.env.CONNECTION === 'offline') {
    const last = generatedMenu.slice(-1)[0]

    generatedMenu = [
      {
        label: "You're offline!",
        enabled: false
      },
      {
        type: 'separator'
      }
    ]

    generatedMenu.push(last)
  }

  return electron.Menu.buildFromTemplate(generatedMenu)
}

const fileDropped = async (event, files) => {
  event.preventDefault()

  if (process.env.CONNECTION === 'offline') {
    showError("You're offline")
    return
  }

  if (!loggedIn) {
    return
  }

  if (files.length > 1) {
    showError(
      "It's not yet possible to share multiple files/directories at once."
    )
    return
  }

  await deploy(files[0])
}

const moveApp = async () => {
  let config

  try {
    config = await getConfig()
  } catch (err) {
    config = {}
  }

  if (config.noMoveWanted || isDev) {
    return
  }

  let moved

  try {
    moved = await moveToApplications()
  } catch (err) {
    showError(err)
    return
  }

  if (!moved) {
    await saveConfig({
      noMoveWanted: true
    })
  }
}

app.on('ready', async () => {
  // Switch over to the new config structure
  await migrate()

  // Offer to move app to Applications directory
  await moveApp()

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

  // Provide application and the CLI with automatic updates
  autoUpdater()

  // DO NOT create the tray icon BEFORE the login status has been checked!
  // Otherwise, the user will start clicking...
  // ...the icon and the app wouldn't know what to do

  // I have no idea why, but path.resolve doesn't work here
  try {
    const iconName = process.platform === 'win32' ? 'iconWhite' : 'iconTemplate'
    tray = new electron.Tray(resolvePath(`./main/static/tray/${iconName}.png`))

    // Opening the context menu after login should work
    global.tray = tray
  } catch (err) {
    showError('Could not spawn tray item', err)
    return
  }

  // Ensure that `next` works with `electron`
  await prepareNext(electron, resolvePath('./renderer'))

  // Extract each window out of the list
  const { mainWindow, tutorialWindow, aboutWindow } = windowList

  // And then put it back into a list :D
  const windows = {
    main: mainWindow(tray),
    tutorial: tutorialWindow(tray),
    about: aboutWindow(tray)
  }

  // Make the window instances accessible from everywhere
  global.windows = windows

  // Listen to changes inside .now.json
  // This needs to be called AFTER setting global.windows
  await watchConfig()

  electron.ipcMain.on('open-menu', async (event, bounds) => {
    if (bounds && bounds.x && bounds.y) {
      bounds.x = parseInt(bounds.x.toFixed(), 10) + bounds.width / 2
      bounds.y = parseInt(bounds.y.toFixed(), 10) - bounds.height / 2

      const menu = await contextMenu(windows)
      menu.popup(bounds.x, bounds.y)
    }
  })

  const toggleActivity = async event => {
    if (loggedIn) {
      toggleWindow(event || null, windows.main, tray)
      return
    }

    toggleWindow(event || null, windows.tutorial)
  }

  // Only allow one instance of Now running
  // at the same time
  const shouldQuit = app.makeSingleInstance(toggleActivity)

  if (shouldQuit) {
    // We're using `exit` because `quit` didn't work
    // on Windows (tested by matheuss)
    return app.exit()
  }

  if (!loggedIn || firstRun()) {
    // Show the tutorial as soon as the content has finished rendering
    // This avoids a visual flash
    windows.tutorial.on('ready-to-show', () =>
      toggleWindow(null, windows.tutorial)
    )
  }

  // When quitting the app, force close the tutorial and about windows
  app.on('before-quit', () => {
    process.env.FORCE_CLOSE = true
  })

  // Define major event listeners for tray
  tray.on('drop-files', fileDropped)
  tray.on('click', toggleActivity)

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
