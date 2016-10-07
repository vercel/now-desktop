const states = {
  hide: false,
  show: true,
  minimize: false,
  restore: true,
  focus: true
}

const windowLeft = win => {
  if (global.tutorial && global.about === win && global.tutorial.isVisible()) {
    return true
  }

  if (global.about && global.tutorial === win && global.about.isVisible()) {
    return true
  }

  return false
}

export default (win, tray) => {
  if (!tray) {
    return
  }

  for (const state in states) {
    if (!{}.hasOwnProperty.call(states, state)) {
      return
    }

    const highlighted = states[state]

    win.on(state, () => {
      if (process.env.FORCE_CLOSE) {
        return
      }

      // Don't toggle highlighting if one window is still open
      if (windowLeft(win)) {
        return
      }

      // Record busyness for auto updater
      process.env.BUSYNESS = highlighted ? 'window-open' : 'ready'

      // Highlight the tray or don't
      tray.setHighlightMode(highlighted ? 'always' : 'never')
    })
  }

  win.on('close', event => {
    if (process.env.FORCE_CLOSE) {
      return
    }

    win.hide()
    event.preventDefault()
  })
}
