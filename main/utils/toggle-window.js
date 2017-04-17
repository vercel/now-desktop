module.exports = (event, window) => {
  const visible = window.isVisible()

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
    window.show()
  }

  if (event) {
    // Don't open the menu
    event.preventDefault()
  }
}
