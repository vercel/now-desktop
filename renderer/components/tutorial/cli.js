// Packages
import electron from 'electron'
import React from 'react'
import exists from 'path-exists'

// Utilities
import installBinary from '../../utils/load-binary'

// Styles
import binaryStyles from '../../styles/components/tutorial/cli'

// Components
import Button from './button'

class Binary extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      binaryInstalled: false,
      installing: false,
      done: false,
      downloading: false,
      progress: false
    }

    this.initialState = Object.assign({}, this.state)
    this.remote = electron.remote || false

    this.openDocumentation = this.openDocumentation.bind(this)
    this.installBinary = installBinary.bind(this)
  }

  async binaryInstalled() {
    if (!this.remote) {
      return
    }

    const binaryUtils = this.remote.require('./utils/binary')
    const binaryPath = binaryUtils.getFile()

    if (await binaryUtils.installedWithNPM()) {
      return true
    }

    if (!await exists(binaryPath)) {
      return false
    }

    return true
  }

  async componentDidMount() {
    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()

    if (await this.binaryInstalled()) {
      currentWindow.focus()

      this.setState({
        binaryInstalled: true
      })
    }

    // We need to refresh the state of the binary section
    // each time the window gets opened
    // because the user might deleted the binary
    currentWindow.on('show', async () => {
      if (this.state.installing) {
        return
      }

      const originalState = Object.assign({}, this.initialState)
      originalState.binaryInstalled = await this.binaryInstalled()

      this.setState(originalState)
    })
  }

  openDocumentation(event) {
    event.preventDefault()

    if (!this.remote) {
      return
    }

    this.remote.shell.openExternal('https://zeit.co/docs')
  }

  render() {
    const { installing, done, binaryInstalled } = this.state

    if (installing) {
      return (
        <article>
          <p className="install-status">
            <strong>Installing the Command Line Interface...</strong>
          </p>

          <p>
            {
              "This should not take too long. If you want, you can minimize this window. We'll let you know once we are done."
            }
          </p>

          {this.state.progress !== false && (
            <aside className="progress">
              <span style={{ width: `${this.state.progress}%` }} />
            </aside>
          )}

          <style jsx>{binaryStyles}</style>
        </article>
      )
    }

    if (done) {
      return (
        <article>
          <p>
            <strong>Hooray! 🎉</strong>
          </p>
          <p>
            The binary successfully landed on your device! You can now use{' '}
            <code>now</code> from the command line.
          </p>

          <p>
            If you want to learn more about how to take advantage of our command
            line interface, <a onClick={this.openDocumentation}>this</a> will be
            helpful.
          </p>

          <style jsx>{binaryStyles}</style>
        </article>
      )
    }

    return (
      <article>
        <p>
          In addition to this app, you can also use <code>now</code> from the
          command line, if you{"'"}d like to.
        </p>
        <p>
          Press the button below to install it! When a new version gets
          released, we
          {"'"}
          ll automatically update it for you.
        </p>

        <Button disabled={binaryInstalled} onClick={this.installBinary}>
          {binaryInstalled ? 'Already installed' : 'Install now'}
        </Button>

        <style jsx>{binaryStyles}</style>
      </article>
    )
  }
}

export default Binary
