// Packages
import electron from 'electron'
import React from 'react'
import { ago as timeAgo } from 'time-ago'
import isDev from 'electron-is-dev'
import isDarkMode from '../utils/dark-mode'

// Components
import Licenses from '../components/about/licenses'

// Utilities
import showError from '../utils/error'
import CloseWindowSVG from '../vectors/close-window'

// Styles
import { mainStyles, globalStyles } from '../styles/pages/about'

class About extends React.PureComponent {
  constructor(props) {
    super(props)

    let releaseDate = '(not yet released)'

    try {
      // eslint-disable-next-line no-undef
      const buildDate = `${BUILD_DATE}`

      if (!isNaN(buildDate)) {
        const ago = timeAgo(new Date(parseInt(buildDate, 10)))
        releaseDate = `(${ago})`
      }
    } catch (err) {}

    this.state = {
      version: null,
      darkMode: false,
      releaseDate
    }
  }

  remote = electron.remote || false
  ipcRenderer = electron.ipcRenderer || false
  isWindows = process.platform === 'win32'

  onThemeChanged = (event, config) => {
    const { darkMode } = config

    this.setState({ darkMode })
  }

  listenThemeChange() {
    if (!this.ipcRenderer) {
      return
    }

    this.ipcRenderer.on('theme-changed', this.onThemeChanged)
  }

  componentDidMount() {
    if (!this.remote) {
      return
    }

    let version

    if (isDev) {
      version = this.remote.process.env.npm_package_version
    } else {
      version = this.remote.app.getVersion()
    }

    this.setState({
      version,
      darkMode: isDarkMode(this.remote)
    })

    // Listen to system darkMode system change
    this.listenThemeChange()
  }

  componentWillUnmount() {
    this.ipcRenderer.removeListener('theme-changed', this.onThemeChanged)
  }

  openLink = event => {
    const link = event.target

    if (!this.remote) {
      return
    }

    this.remote.shell.openExternal(link.href)
    event.preventDefault()
  }

  handleTutorial = () => {
    if (!this.remote) {
      return
    }

    const windows = this.remote.getGlobal('windows')

    if (!windows || !windows.tutorial) {
      showError('Not able to open tutorial window')
      return
    }

    windows.tutorial.show()
  }

  handleCloseClick = () => {
    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
    currentWindow.hide()
  }

  render() {
    return (
      <main>
        <div className={this.state.darkMode ? 'dark' : ''}>
          {this.isWindows && (
            <div className="window-controls">
              <span onClick={this.handleCloseClick}>
                <CloseWindowSVG />
              </span>
            </div>
          )}
          <section className="wrapper">
            <span className="window-title">About</span>

            <img src="/static/app-icon.png" />

            <h1>Now</h1>
            <h2>
              Version {this.state.version ? <b>{this.state.version}</b> : ''}{' '}
              {this.state.releaseDate ? this.state.releaseDate : ''}
            </h2>

            <article>
              <h1>Authors</h1>

              <p>
                <a
                  href="https://twitter.com/notquiteleo"
                  onClick={this.openLink}
                >
                  Leo Lamprecht
                </a>
                <br />
                <a
                  href="https://twitter.com/evilrabbit_"
                  onClick={this.openLink}
                >
                  Evil Rabbit
                </a>
                <br />
                <a href="https://twitter.com/rauchg" onClick={this.openLink}>
                  Guillermo Rauch
                </a>
                <br />
                <a
                  href="https://twitter.com/matheusfrndes"
                  onClick={this.openLink}
                >
                  Matheus Fernandes
                </a>
              </p>

              <h1>{'3rd party software'}</h1>
              <Licenses darkBg={this.state.darkMode} />
            </article>

            <span className="copyright">
              Made by{' '}
              <a href="https://zeit.co" onClick={this.openLink}>
                ZEIT
              </a>
            </span>

            <nav>
              <a href="https://zeit.co/docs" onClick={this.openLink}>
                Docs
              </a>
              <a
                href="https://github.com/zeit/now-desktop"
                onClick={this.openLink}
              >
                Source
              </a>
              <a onClick={this.handleTutorial}>Tutorial</a>
            </nav>
          </section>
        </div>

        <style jsx>{mainStyles}</style>
        <style jsx global>
          {globalStyles}
        </style>
      </main>
    )
  }
}

export default About
