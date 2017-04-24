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
  }

  position() {
    const tray = remote.getGlobal('tray')

    if (!this.currentWindow || !tray) {
      return
    }

    const trayBounds = tray.getBounds()
    const windowBounds = this.currentWindow.getBounds()

    const trayCenter = trayBounds.x + trayBounds.width / 2
    const windowLeft = windowBounds.x

    const caretLeft = trayCenter - windowLeft - 28 / 2

    this.setState({
      left: caretLeft
    })
  }

  componentDidMount() {
    this.position()
    this.currentWindow = remote.getCurrentWindow()

    this.currentWindow.on('show', () => {
      this.position()
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
