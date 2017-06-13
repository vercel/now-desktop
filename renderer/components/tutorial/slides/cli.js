// Packages
import electron from 'electron'
import React from 'react'
import exists from 'path-exists'

// Utilities
import installBinary from '../../../utils/load-binary'

const initialState = {
  binaryInstalled: false,
  installing: false,
  done: true,
  downloading: false,
  progress: false
}

class Binary extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = initialState
    this.remote = electron.remote || false
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

      const originalState = Object.assign({}, initialState)
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
    const element = this

    let classes = 'button install'
    let installText = 'Install now'

    if (this.state.binaryInstalled) {
      classes += ' off'
      installText = 'Already installed'
    }

    const binaryButton = {
      className: classes,
      onClick() {
        if (element.state.binaryInstalled) {
          return
        }

        installBinary(element)
      }
    }

    if (this.state.installing) {
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

          {this.state.progress !== false &&
            <aside className="progress">
              <span style={{ width: `${this.state.progress}%` }} />
            </aside>}

          <style jsx>
            {`
              article {
                width: 415px;
                font-size: 14px;
                text-align: center;
                line-height: 22px;
              }
              .progress {
                background: #CCC;
                height: 20px;
                width: 250px;
                overflow: hidden;
                margin: 40px auto 0 auto;
                border-radius: 3px;
              }
              .progress span {
                display: block;
                background: #000;
                height: inherit;
              }
            `}
          </style>
        </article>
      )
    }

    if (this.state.done) {
      return (
        <article>
          <p><strong>Hooray! 🎉</strong></p>
          <p>
            The binary successfully landed on your device! You can now use{' '}
            <code>now</code> from the command line.
          </p>

          <p>
            If you want to learn more about how to take advantage of our
            command line interface,{' '}
            <a onClick={this.openDocumentation.bind(this)}>this</a> will be
            helpful.
          </p>

          <style jsx>
            {`
              article {
                width: 415px;
                font-size: 14px;
                text-align: center;
                line-height: 22px;
              }
              code {
                background: #eaeaea;
                padding: 1px 7px;
                border-radius: 3px;
                font-weight: 600;
              }
              a {
                text-decoration: none;
                color: #067DF7;
                cursor: pointer;
              }
              a:hover {
                border-bottom: 1px solid #067DF7;
              }
            `}
          </style>
        </article>
      )
    }

    return (
      <article>
        <p>
          In addition to this app, you can also use
          {' '}
          <code>now</code>
          {' '}
          from the command line, if you{`'`}d like to.
        </p>
        <p>
          Press the button below to install it! When a new version gets
          released, we
          {`'`}
          ll automatically update it for you.
        </p>

        <a {...binaryButton}>{installText}</a>

        <style jsx>
          {`
            article {
              width: 415px;
              font-size: 14px;
              text-align: center;
              line-height: 22px;
            }
            code {
              font-weight: 600;
              background: #eaeaea;
              padding: 1px 7px;
              border-radius: 3px;
            }
            .button {
              font-weight: 700;

              text-transform: uppercase;
              background: #000;
              text-align: center;
              text-decoration: none;
              color: #fff;
              font-size: 12px;
              padding: 10px 28px;
              transition: color .2s ease, background .2s ease;
              cursor: pointer;
              display: inline-block;
              line-height: normal;
              -webkit-app-region: no-drag;
              border: 2px solid currentColor;
            }
            .button:hover {
              background: transparent;
              color: #000;
            }
            .install {
              margin-top: 20px;
              display: inline-block;
            }
            .install.off {
              background: transparent;
              font-size: 13px;
              cursor: default;
              color: #999999;
              border-color: transparent;
            }
          `}
        </style>
      </article>
    )
  }
}

export default Binary
