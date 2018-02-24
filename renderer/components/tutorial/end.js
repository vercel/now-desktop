// Packages
import electron from 'electron'
import { Component } from 'react'

// Styles
import introStyles from '../../styles/components/tutorial/intro'

// Components
import Button from './button'

class End extends Component {
  remote = electron.remote || false

  showApp = event => {
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
        <p>
          <b>{`It's that simple!`}</b>
        </p>

        <p className="has-mini-spacing">
          Are you ready to deploy something now? If so, simply click the button
          below to view the event feed:
        </p>

        <Button onClick={this.showApp} className="get-started">
          Get Started
        </Button>
        <style jsx>{introStyles}</style>
      </article>
    )
  }
}

export default End
