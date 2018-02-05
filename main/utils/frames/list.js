// Packages
const electron = require('electron')
const { setWindowURL } = require('neutron')

// Utilities
const attachTrayState = require('../highlight')
const positionWindow = require('./position')

// Check if Windows
const isWinOS = process.platform === 'win32'

exports.tutorialWindow = tray => {
  const win = new electron.BrowserWindow({
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
    backgroundColor: '#000',
    webPreferences: {
      backgroundThrottling: false,
      devTools: true
    }
  })

  setWindowURL(win, 'tutorial')
  attachTrayState(win, tray)

  const emitTrayClick = aboutWindow => {
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
    win.close()
  }

  win.on('open-tray', emitTrayClick)

  // Just hand it back
  return win
}

exports.aboutWindow = tray => {
  const win = new electron.BrowserWindow({
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
    backgroundColor: '#ECECEC',
    webPreferences: {
      backgroundThrottling: false,
      devTools: true
    }
  })

  setWindowURL(win, 'about')
  attachTrayState(win, tray)

  return win
}

exports.mainWindow = tray => {
  let windowHeight = 380

  if (isWinOS) {
    windowHeight -= 12
  }

  const win = new electron.BrowserWindow({
    width: 330,
    height: windowHeight,
    title: 'Now',
    resizable: false,
    show: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    transparent: true,
    frame: false,
    movable: false,
    webPreferences: {
      backgroundThrottling: false,
      devTools: true
    }
  })

  positionWindow(tray, win)

  setWindowURL(win, 'feed')
  attachTrayState(win, tray)

  // Hide window if it's not focused anymore
  // This can only happen if the dev tools are not open
  // Otherwise, we won't be able to debug the renderer
  win.on('blur', () => {
    if (win.webContents.isDevToolsOpened()) {
      return
    }

    if (!isWinOS) {
      win.close()
      return
    }

    const { screen } = electron
    const cursor = screen.getCursorScreenPoint()
    const trayBounds = global.tray.getBounds()

    const xAfter = cursor.x <= trayBounds.x + trayBounds.width
    const x = cursor.x >= trayBounds.x && xAfter
    const yAfter = trayBounds.y + trayBounds.height
    const y = cursor.y >= trayBounds.y && cursor.y <= yAfter

    // Don't close the window on click on the tray icon
    // Because that will already toogle the window
    if (x && y) {
      return
    }

    win.close()
  })

  return win
}
