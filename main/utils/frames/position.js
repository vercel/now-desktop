// Native
const { platform } = require('os')

let trayBoundsCache = null

module.exports = (tray, window) => {
  const trayBounds = tray.getBounds()
  const isWin = platform() === 'win32'

  if (trayBoundsCache) {
    // Compare only the object props
    if (JSON.stringify(trayBoundsCache) === JSON.stringify(trayBounds)) {
      return
    }
  }

  // Cache the tray position
  trayBoundsCache = trayBounds

  // This module needs to be loaded after the app is ready
  // I don't know why, but that's required by electron
  const { screen } = require('electron')

  const windowSize = window.getSize()
  const trayCenter = trayBounds.x + trayBounds.width / 2

  let horizontalPosition = trayCenter - windowSize[0] / 2
  let verticalPosition = trayBounds.height + 6

  // Find the current display
  const display = screen.getDisplayMatching(trayBounds)

  if (display) {
    const displayArea = display.workAreaSize

    const left = horizontalPosition + windowSize[0]
    const maxLeft = displayArea.width - (isWin ? 25 : 18)

    // Check if window would be outside screen
    // If yes, make sure it isn't
    if (left > maxLeft) {
      horizontalPosition -= left - maxLeft
    }

    if (isWin) {
      const offset = trayBounds.height + windowSize[1] - 25
      verticalPosition = displayArea.height - offset
    }
  }

  window.setPosition(horizontalPosition, verticalPosition)
}
