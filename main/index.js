if (require('electron-squirrel-startup')) {
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit()
}

// Packages
const { Menu, app, Tray, BrowserWindow, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const fixPath = require('fix-path')
const { resolve: resolvePath } = require('app-root-path')
const firstRun = require('first-run')
const { moveToApplications } = require('electron-lets-move')

// Utilities
const { outerMenu, deploymentOptions, innerMenu } = require('./menu')
const { error: showError } = require('./dialogs')
const deploy = require('./actions/deploy')
const autoUpdater = require('./updates')
const { prepareCache, startRefreshing, isLoggedIn } = require('./api')
const toggleWindow = require('./utils/frames/toggle')
const server = require('./server')
const {
  aboutWindow,
  tutorialWindow,
  mainWindow
} = require('./utils/frames/list')
const migrate = require('./utils/migrate')
const { get: getConfig, save: saveConfig } = require('./utils/config')

// Prevent garbage collection
// Otherwise the tray icon would randomly hide after some time
let tray = null

// Prevent having to check for login status when opening the window
let loggedIn = null

const setLoggedInStatus = async () => {
  loggedIn = await isLoggedIn()
}

// Check status once in the beginning when the app starting up
setLoggedInStatus()

// And then every 2 seconds
// We could to this on click on the tray icon, but we
// don't want to block that action
setInterval(setLoggedInStatus, 2000)

// Set the application's name
app.setName('Now')

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

// Make sure that unhandled errors get handled
process.on('uncaughtException', err => {
  console.error(err)
  showError('Unhandled error appeared', err)
})

const cache = prepareCache()

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

// Convert date string = API to valid date object
const toDate = int => new Date(parseInt(int, 10))

const contextMenu = async windows => {
  const deployments = cache.get('deployments')
  const aliases = cache.get('aliases')

  const apps = new Map()
  const deploymentList = []

  if (deployments) {
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
  }

  const data = {
    deployments: deploymentList
  }

  let generatedMenu = await innerMenu(app, tray, data, windows)

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

  return Menu.buildFromTemplate(generatedMenu)
}

const fileDropped = async (event, files) => {
  event.preventDefault()

  if (process.env.CONNECTION === 'offline') {
    showError("You're offline")
    return
  }

  if (!await isLoggedIn()) {
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

  const onlineStatusWindow = new BrowserWindow({
    width: 0,
    height: 0,
    show: false
  })

  onlineStatusWindow.loadURL(
    'file://' + resolvePath('./main/static/pages/status.html')
  )

  ipcMain.on('online-status-changed', (event, status) => {
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
    tray = new Tray(resolvePath(`./main/static/tray/${iconName}.png`))

    // Opening the context menu after login should work
    global.tray = tray
  } catch (err) {
    showError('Could not spawn tray item', err)
    return
  }

  if (isDev) {
    try {
      await server()
    } catch (err) {
      console.error(err)
      return
    }
  }

  const windows = {
    main: mainWindow(tray),
    tutorial: tutorialWindow(tray),
    about: aboutWindow(tray)
  }

  // Make the window instances accessible from everywhere
  global.windows = windows

  ipcMain.on('open-menu', async (event, bounds) => {
    if (bounds && bounds.x && bounds.y) {
      bounds.x = parseInt(bounds.x.toFixed(), 10) + bounds.width / 2
      bounds.y = parseInt(bounds.y.toFixed(), 10) - bounds.height / 2

      const menu = await contextMenu(windows)
      menu.popup(bounds.x, bounds.y)
    }
  })

  const toggleActivity = async event => {
    if (loggedIn && !windows.tutorial.isVisible()) {
      toggleWindow(event || null, windows.main, tray)
    } else {
      toggleWindow(event || null, windows.tutorial)
    }
  }

  // Only allow one instance of Now running
  // at the same time
  const shouldQuit = app.makeSingleInstance(toggleActivity)

  if (shouldQuit) {
    // We're using `exit` because `quit` didn't work
    // on Windows (tested by matheuss)
    return app.exit()
  }

  // If the user is logged in and the app isn't running
  // the first time, immediately start refreshing the data

  // Otherwise, ask the user to log in using the tutorial
  if ((await isLoggedIn()) && !firstRun()) {
    // Periodically rebuild local cache every 10 seconds
    await startRefreshing()
  } else {
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

  let isHighlighted = false
  let submenuShown = false

  tray.on('right-click', async event => {
    if (await isLoggedIn()) {
      toggleWindow(event, windows.main, tray)
      return
    }

    const menu = outerMenu(app, windows)

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
