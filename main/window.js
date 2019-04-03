const { platform } = require('os')
const path = require('path')
const electron = require('electron')
const isDev = require('electron-is-dev')
const isEqual = require('react-fast-compare')
const Positioner = require('electron-positioner')

// Check if Windows or Mac
const isWinOS = process.platform === 'win32'
const isMacOS = process.platform === 'darwin'

let darkMode = false
let trayBoundsCache = null
let displayAreaCache = null

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

const states = {
  hide: false,
  show: true,
  minimize: false,
  restore: true,
  focus: true
}

const attachTrayState = (win, tray) => {
  if (!tray) {
    return
  }

  for (const state of Object.keys(states)) {
    const highlighted = states[state]

    win.on(state, () => {
      // Highlight the tray or don't
      tray.setHighlightMode(highlighted ? 'always' : 'selection')
    })
  }

  electron.app.on('before-quit', () => {
    win.destroy()
  })

  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })
}

exports.getWindow = tray => {
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
      preload: path.join(__dirname, './static/preload.js')
    }
  })

  win.setVisibleOnAllWorkspaces(true)

  exports.positionWindow(tray, win)

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

    const cursor = electron.screen.getCursorScreenPoint()
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

exports.toggleWindow = (event, window, tray) => {
  const isVisible = window.isVisible()
  const isWin = process.platform === 'win32'

  if (event) {
    // Don't open the menu
    event.preventDefault()
  }

  // If window open and not focused, bring it to focus
  if (!isWin && isVisible && !window.isFocused()) {
    window.focus()
    return
  }

  // Show or hide onboarding window
  // Calling `.close()` will actually make it
  // hide, but it's a special scenario which we're
  // listening for in a different// If the "blur" event was triggered when
  // clicking on the tray icon, don't do anything place
  if (isVisible) {
    window.close()
  } else {
    // Position main window correctly under the tray icon
    exports.positionWindow(tray, window)
    window.show()
  }
}

exports.positionWindow = (tray, window) => {
  const { screen } = electron
  const screenPoint = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(screenPoint)
  const displayArea = display.workArea
  const trayBounds = tray.getBounds()
  const notMacOS = platform() !== 'darwin'

  if (trayBoundsCache && displayAreaCache) {
    // Compare only the object props
    if (
      isEqual(trayBoundsCache, trayBounds) &&
      isEqual(displayAreaCache, displayArea)
    ) {
      return
    }
  }

  trayBoundsCache = trayBounds
  displayAreaCache = displayArea

  const positioner = new Positioner(window)
  const windowPosition = notMacOS ? 'trayBottomCenter' : 'trayCenter'
  const { x, y } = positioner.calculate(windowPosition, trayBoundsCache)
  const vertical = notMacOS ? y : y + 7

  window.setPosition(x, vertical)
}
