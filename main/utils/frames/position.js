module.exports = (tray, window) => {
  // This module needs to be loaded after the app is ready
  // I don't know why, but that's required by electron
  const { screen } = require('electron')

  const trayBounds = tray.getBounds()
  const windowWidth = window.getSize()[0]
  const trayCenter = trayBounds.x + trayBounds.width / 2

  let horizontalPosition = trayCenter - windowWidth / 2
  const verticalPosition = trayBounds.height + 6

  // Find the current display
  const display = screen.getDisplayMatching(trayBounds)

  if (display) {
    const displayWidth = display.workAreaSize.width

    const left = horizontalPosition + windowWidth
    const maxLeft = displayWidth - 20

    // Check if window would be outside screen
    // If yes, make sure it isn't
    if (left > maxLeft) {
      horizontalPosition -= left - maxLeft
    }
  }

  window.setPosition(horizontalPosition, verticalPosition)
}
