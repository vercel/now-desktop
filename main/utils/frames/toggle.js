const positionWindow = require('./position')

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
