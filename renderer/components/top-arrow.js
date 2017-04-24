// Packages
import React from 'react'

// Components
import Caret from '../vectors/caret'

// Utilities
import remote from '../utils/electron'

class TopArrow extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      left: 0
    }

    setInterval(() => {
      this.tryPosition()
    }, 500)
  }

  tryPosition() {
    if (!remote.process || !remote.getCurrentWindow) {
      return
    }

    const currentWindow = remote.getCurrentWindow()

    if (currentWindow.isVisible()) {
      return
    }

    this.position()
  }

  position() {
    const currentWindow = remote.getCurrentWindow()
    const tray = remote.getGlobal('tray')

    if (!currentWindow || !tray) {
      return
    }

    const trayBounds = tray.getBounds()

    // Ensure that the position of the caret
    // only gets updated if the position of the tray
    // icon as changed (and once in the beginning)
    if (this.savedTrayBounds) {
      // We need to avoid the prototype comparision
      if (JSON.stringify(this.savedTrayBounds) === JSON.stringify(trayBounds)) {
        return
      }
    }

    // This is also part of the action mentioned above
    this.savedTrayBounds = trayBounds

    // Get size and position of current window
    const windowBounds = currentWindow.getBounds()

    const trayCenter = trayBounds.x + trayBounds.width / 2
    const windowLeft = windowBounds.x

    const caretLeft = trayCenter - windowLeft - 28 / 2

    remote.process.stdout.write('dasdsa')

    this.setState({
      left: caretLeft
    })
  }

  render() {
    return (
      <span style={{ marginLeft: this.state.left }}>
        <Caret />

        <style jsx>
          {`
          span {
            height: 13px;
            margin-bottom: -1px;
            flex-shrink: 0;
          }
        `}
        </style>
      </span>
    )
  }
}

export default TopArrow
