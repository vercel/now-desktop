// Native
const { platform } = require('os')

// Packages
const compare = require('just-compare')

let trayBoundsCache = null

module.exports = (tray, window) => {
  const trayBounds = tray.getBounds()
  const isWin = platform() === 'win32'

  if (trayBoundsCache) {
    // Compare only the object props
    if (compare(trayBoundsCache, trayBounds)) {
      return
    }
  }

  // Cache the tray position
  trayBoundsCache = trayBounds

  // This module needs to be loaded after the app is ready
  // I don't know why, but that's required by electron
  const { screen } = require('electron')
  const windowSize = window.getSize()

  let horizontalPosition
  let verticalPosition

  if (!isWin) {
    const trayCenter = trayBounds.x + trayBounds.width / 2

    horizontalPosition = trayCenter - windowSize[0] / 2
    verticalPosition = trayBounds.height + 6
  }

  // Find the current display
  const display = screen.getDisplayMatching(trayBounds)
  const displayArea = display.workAreaSize

  if (isWin) {
    horizontalPosition = displayArea.width - windowSize[0]
    verticalPosition = displayArea.height - windowSize[1]
  } else {
    const left = horizontalPosition + windowSize[0]
    const maxLeft = displayArea.width - 18

    // Check if window would be outside screen
    // If yes, make sure it isn't
    if (left > maxLeft) {
      horizontalPosition -= left - maxLeft
    }
  }

  window.setPosition(horizontalPosition, verticalPosition)
}
