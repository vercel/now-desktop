// Native
import { execSync } from 'child_process'

// Packages
import electron from 'electron'
import React, { Component } from 'react'
import semVer from 'semver'
import pathType from 'path-type'
import exists from 'path-exists'

// Utilities
import installBinary from '../../utils/load-binary'

const initialState = {
  binaryInstalled: false,
  installing: false,
  done: false,
  downloading: false,
  progress: false
}

class Binary extends Component {
  constructor(props) {
    super(props)

    this.state = initialState
    this.remote = electron.remote || false
  }

  async isOlderThanLatest(utils, binaryPath) {
    let current

    try {
      current = await utils.getURL()
    } catch (err) {
      return
    }

    if (!current) {
      return
    }

    const remoteVersion = current.version
    let localVersion

    try {
      localVersion = execSync(binaryPath + ' -v').toString()
    } catch (err) {
      return
    }

    const comparision = semVer.compare(remoteVersion, localVersion)

    if (comparision === 1) {
      return true
    }

    return false
  }

  async binaryInstalled() {
    if (!this.remote) {
      return
    }

    const binaryUtils = this.remote.require('./utils/binary')
    const binaryPath = binaryUtils.getFile()

    if (!await exists(binaryPath)) {
      return false
    }

    if (await pathType.symlink(binaryPath)) {
      return false
    }

    if (await this.isOlderThanLatest(binaryUtils, binaryPath)) {
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
      const dots = this.state.progress === false ? '' : '...'

      return (
        <article>
          <p className="install-status">
            <strong>{'Installing the command line interface' + dots}</strong>

            {this.state.progress === false &&
              <span>
                <i>.</i>
                <i>.</i>
                <i>.</i>
              </span>}
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

            .install-status i {
              font-weight: 700;
              font-style: normal;
              animation-name: blink;
              animation-duration: 1.4s;
              animation-iteration-count: infinite;
              animation-fill-mode: both;
              font-size: 150%;
            }

            .install-status i:nth-child(3) {
              animation-delay: .2s;
            }

            .install-status i:nth-child(4) {
              animation-delay: .4s;
            }

            @keyframes blink {
              0% {
                opacity: 0.1;
              }

              20% {
                opacity: 1;
              }

              100% {
                opacity: .2;
              }
            }

            .progress {
              background: #636363;
              height: 20px;
              width: 250px;
              overflow: hidden;
              margin: 20px auto 0 auto;
              border-radius: 3px;
            }

            .progress span {
              display: block;
              background: #fff;
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
          <p>The binary successfully landed in its directory!</p>
          <p>You can now use <code>now</code> from the command line.</p>

          <style jsx>
            {`
            article {
              width: 415px;
              font-size: 14px;
              text-align: center;
              line-height: 22px;
            }

            code {
              font-weight: 700;
              background: #212121;
              padding: 1px 7px;
              border-radius: 3px;
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
          Press the button below to install it! When a new version gets released, we
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
            font-weight: 700;
            background: #212121;
            padding: 1px 7px;
            border-radius: 3px;
          }

          .button {
            font-weight: 700;
            text-transform: uppercase;
            background: #000;
            border: 2px solid #fff;
            text-align: center;
            text-decoration: none;
            color: #fff;
            font-size: 12px;
            padding: 8px 20px;
            transition: color .2s ease, background .2s ease;
            cursor: pointer;
            display: inline-block;
            line-height: normal;
            -webkit-app-region: no-drag;
          }

          .button:hover {
            background: #fff;
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
            color: #636363;
            border-color: currentColor;
          }
        `}
        </style>
      </article>
    )
  }
}

export default Binary
