const electron = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const attachTrayState = require('../highlight')
const positionWindow = require('./position')

// Check if Windows or Mac
const isWinOS = process.platform === 'win32'
const isMacOS = process.platform === 'darwin'

let darkMode = false

if (isMacOS) {
  darkMode = electron.systemPreferences.isDarkMode()
} else if (isWinOS) {
  darkMode = electron.systemPreferences.isInvertedColorScheme()
}

const loadPage = (win, page) => {
  if (isDev) {
    win.loadURL(`http://localhost:8000/${page}`)
  } else {
    win.loadFile(`${electron.app.getAppPath()}/renderer/out/${page}/index.html`)
  }
}

module.exports = tray => {
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
    backgroundColor: darkMode ? '#1f1f1f' : '#ffffff',
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      devTools: true,
      preload: path.join(__dirname, '../preload.js')
    }
  })

  win.setVisibleOnAllWorkspaces(true)
  win.webContents.openDevTools()

  positionWindow(tray, win)

  loadPage(win, 'feed')
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
    // Because that will already toggle the window
    if (x && y) {
      return
    }

    win.close()
  })

  return win
}
