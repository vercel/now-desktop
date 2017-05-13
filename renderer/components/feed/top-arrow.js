// Packages
import React from 'react'

// Components
import Caret from '../../vectors/caret'

// Utilities
import remote from '../../utils/electron'

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

  preventDefault(event) {
    event.preventDefault()
  }

  tryPosition() {
    if (!remote.process || !remote.getCurrentWindow) {
      return
    }

    const currentWindow = remote.getCurrentWindow()
    const tray = remote.getGlobal('tray')

    if (!currentWindow || !tray) {
      return
    }

    // Center the caret unter the tray icon
    const windowBounds = currentWindow.getBounds()
    this.position(tray, windowBounds)
  }

  position(tray, windowBounds) {
    const trayBounds = tray.getBounds()

    const trayCenter = trayBounds.x + trayBounds.width / 2
    const windowLeft = windowBounds.x

    const caretLeft = trayCenter - windowLeft - 28 / 2

    this.setState({
      left: caretLeft
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.left === prevState.left) {
      return
    }

    const currentWindow = remote.getCurrentWindow()
    const size = currentWindow.getSize()

    setTimeout(() => {
      size[1]++
      currentWindow.setSize(...size, true)
    }, 100)

    setTimeout(() => {
      size[1]--
      currentWindow.setSize(...size, true)
    }, 110)
  }

  render() {
    return (
      <span
        style={{ paddingLeft: this.state.left }}
        onDragOver={this.preventDefault}
        onDrop={this.preventDefault}
      >
        <Caret />

        <style jsx>
          {`
          span {
            height: 12px;
            flex-shrink: 0;
            display: block;
          }
        `}
        </style>
      </span>
    )
  }
}

export default TopArrow
