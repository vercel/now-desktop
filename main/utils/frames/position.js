// Native
const { platform } = require('os')

// Packages
const isEqual = require('react-fast-compare')
const Positioner = require('electron-positioner')

let trayBoundsCache = null
let displayAreaCache = null

module.exports = (tray, window) => {
  const { screen } = require('electron')
  const screenPoint = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(screenPoint)
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

  trayBoundsCache = trayBounds
  displayAreaCache = displayArea

  const positioner = new Positioner(window)

  const windowPosition = notMacOS ? 'trayBottomCenter' : 'trayCenter'

  let noBoundsPosition = null

  if (
    (trayBoundsCache === undefined || trayBoundsCache.x === 0) &&
    windowPosition.substr(0, 4) === 'tray'
  ) {
    noBoundsPosition = notMacOS ? 'bottomRight' : 'topRight'
  }

  const { x, y } = positioner.calculate(
    noBoundsPosition || windowPosition,
    trayBoundsCache
  )

  const vertical = notMacOS ? y : y + 7

  window.setPosition(x, vertical)
}
