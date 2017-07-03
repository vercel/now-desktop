// Packages
import electron from 'electron'
import React from 'react'

// Components
import Caret from '../../vectors/caret'

// Styles
import styles from '../../styles/components/feed/top-arrow'

class TopArrow extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      left: 0
    }

    this.remote = electron.remote || false
  }

  preventDefault(event) {
    event.preventDefault()
  }

  componentDidMount() {
    // Calculate top arrow position once in the beginning
    this.tryPosition()

    // And then every 500 milliseconds
    setInterval(() => {
      this.tryPosition()
    }, 500)
  }

  tryPosition() {
    if (!this.remote) {
      return
    }

    if (!this.remote.process || !this.remote.getCurrentWindow) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
    const tray = this.remote.getGlobal('tray')

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

    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
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
    const style = {}

    if (this.state.left) {
      style.paddingLeft = this.state.left
    }

    return (
      <span
        style={style}
        onDragOver={this.preventDefault}
        onDrop={this.preventDefault}
      >
        <Caret />

        <style jsx>
          {styles}
        </style>
      </span>
    )
  }
}

export default TopArrow
