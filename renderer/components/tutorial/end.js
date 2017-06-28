// Packages
import electron from 'electron'
import React, { Component } from 'react'

// Styles
import introStyles from '../../styles/components/tutorial/intro'

// Components
import Button from './button'

class End extends Component {
  constructor(props) {
    super(props)

    this.remote = electron.remote || false
    this.showApp = this.showApp.bind(this)
  }

  showApp(event) {
    event.preventDefault()

    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()

    // Show the event feed
    currentWindow.emit('open-tray')
  }

  render() {
    return (
      <article>
        <p><b>That was the tutorial!</b></p>

        <p className="has-mini-spacing">
          Are you ready to
          deploy something now? If so, simply click the
          button below to view the event feed:
        </p>

        <Button onClick={this.showApp}>Get Started</Button>
        <style jsx>{introStyles}</style>
      </article>
    )
  }
}

export default End
