// Packages
const { app } = require('electron')

const states = {
  hide: false,
  show: true,
  minimize: false,
  restore: true,
  focus: true
}

const windowLeft = win => {
  const windows = global.windows

  if (!windows) {
    return false
  }

  if (
    windows.tutorial &&
    windows.about === win &&
    windows.tutorial.isVisible()
  ) {
    return true
  }

  if (windows.about && windows.tutorial === win && windows.about.isVisible()) {
    return true
  }

  return false
}

module.exports = (win, tray) => {
  if (!tray) {
    return
  }

  for (const state of Object.keys(states)) {
    const highlighted = states[state]

    win.on(state, () => {
      // Don't toggle highlighting if one window is still open
      if (windowLeft(win)) {
        return
      }

      // Highlight the tray or don't
      tray.setHighlightMode(highlighted ? 'always' : 'selection')
    })
  }

  app.on('before-quit', () => {
    win.destroy()
  })

  win.on('close', event => {
    event.preventDefault()
    win.hide()
  })
}
