const positionWindow = (tray, window) => {
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

module.exports = (event, window, tray) => {
  // Check if the current window is visible
  const visible = window.isVisible()

  if (event) {
    // Don't open the menu
    event.preventDefault()
  }

  // If window open and not focused, bring it to focus
  if (visible && !window.isFocused()) {
    window.focus()
    return
  }

  // Show or hide onboarding window
  // Calling `.close()` will actually make it
  // hide, but it's a special scenario which we're
  // listening for in a different place
  if (visible) {
    window.close()
  } else {
    // Position main window correctly under the tray icon
    if (global.windows && window === global.windows.main) {
      positionWindow(tray, window)
    }

    window.show()
  }
}
