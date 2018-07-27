// Native
const { platform } = require('os')

// Packages
const isEqual = require('react-fast-compare')

let trayBoundsCache = null
let displayAreaCache = null

module.exports = (tray, window) => {
  // This module needs to be loaded after the app is ready
  // I don't know why, but that's required by electron
  const { screen } = require('electron')
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
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

  // Cache the tray and display positions
  trayBoundsCache = trayBounds
  displayAreaCache = displayArea

  const windowSize = window.getSize()

  let horizontalPosition
  let verticalPosition

  if (notMacOS) {
    horizontalPosition = displayArea.x + displayArea.width - windowSize[0]
    verticalPosition = displayArea.y + displayArea.height - windowSize[1]
  } else {
    const trayCenter = trayBounds.x + trayBounds.width / 2
    horizontalPosition = trayCenter - windowSize[0] / 2

    // The macOS implementation of Electron.Tray ceils trayBounds.y to zero
    // making it unreliable for vertically positioning the window.
    // Use the display's work area instead.
    verticalPosition = displayArea.y + 5

    if (screen.getPrimaryDisplay().workArea.height === 0) {
      verticalPosition += 22
    }
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
