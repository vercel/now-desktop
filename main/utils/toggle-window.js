module.exports = (event, window, tray) => {
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
    if (global.windows && window === global.windows.main) {
      const trayBounds = tray.getBounds()
      const windowWidth = window.getSize()[0]
      const trayCenter = trayBounds.x + trayBounds.width / 2

      const horizontalPosition = trayCenter - windowWidth / 2
      const verticalPosition = trayBounds.height + 6

      window.setPosition(horizontalPosition, verticalPosition)
    }

    window.show()
  }
}
