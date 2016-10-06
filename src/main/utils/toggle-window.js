export default (event, window) => {
  const visible = window.isVisible()

  // If window open and not focused, bring it to focus
  if (visible && !window.isFocused()) {
    window.focus()
    return
  }

  // Show or hide onboarding window
  if (visible) {
    window.hide()
  } else {
    window.show()
  }

  if (event) {
    // Don't open the menu
    event.preventDefault()
  }
}
