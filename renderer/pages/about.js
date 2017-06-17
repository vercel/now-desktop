// Native
import { platform } from 'os'

// Packages
import electron from 'electron'
import React from 'react'
import timeAgo from 'time-ago'
import isDev from 'electron-is-dev'

// Vectors
import CloseWindowSVG from '../vectors/close-window'
import UpdatedSVG from '../vectors/updated'

// Components
import Licenses from '../components/about/licenses'

// Helpers
import showError from '../utils/error'

// Styles
import { mainStyles, globalStyles, updateStyles } from '../styles/pages/about'

class About extends React.PureComponent {
  constructor(props) {
    super(props)

    this.remote = electron.remote || false
    this.isWindows = platform() === 'win32'

    this.handleTutorial = this.handleTutorial.bind(this)
    this.updateStatus = this.updateStatus.bind(this)
    this.handleCloseClick = this.handleCloseClick.bind(this)
    this.openLink = this.openLink.bind(this)
    this.getAppVersion = this.getAppVersion.bind(this)
  }

  getAppVersion() {
    if (!this.remote) {
      return false
    }

    if (isDev) {
      return this.remote.process.env.npm_package_version
    }

    return this.remote.app.getVersion()
  }

  openLink(event) {
    const link = event.target

    if (!this.remote) {
      return
    }

    this.remote.shell.openExternal(link.href)
    event.preventDefault()
  }

  async componentDidMount() {
    await this.lastReleaseDate()
  }

  async lastReleaseDate() {
    let data

    try {
      data = await fetch(
        'https://api.github.com/repos/zeit/now-desktop/releases'
      )
    } catch (err) {
      console.log(err)
      return
    }

    if (!data.ok) {
      return
    }

    try {
      data = await data.json()
    } catch (err) {
      console.log(err)
      return
    }

    let localRelease

    for (const release of data) {
      if (release.tag_name === this.getAppVersion()) {
        localRelease = release
      }
    }

    if (!localRelease) {
      this.setState({
        lastReleaseDate: '(not yet released)'
      })

      return
    }

    const setReleaseDate = () => {
      const ago = timeAgo().ago(new Date(localRelease.published_at))

      this.setState({
        lastReleaseDate: `(${ago})`
      })
    }

    setReleaseDate()

    // Make sure the date stays updated
    setInterval(setReleaseDate, 1000)
  }

  handleTutorial() {
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

  handleCloseClick() {
    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
    currentWindow.hide()
  }

  updateStatus() {
    const isDev = this.remote ? this.remote.require('electron-is-dev') : false

    return (
      <div>
        {isDev
          ? <h2 className="update development">
              {"You're in development mode. No updates!"}
            </h2>
          : <h2 className="update latest">
              <UpdatedSVG onClick={this.handleCloseClick.bind(this)} />
              {"You're running the latest version!"}
            </h2>}

        <style jsx>{updateStyles}</style>
      </div>
    )
  }

  render() {
    const appVersion = this.getAppVersion()

    return (
      <div>
        {this.isWindows &&
          <div className="window-controls">
            <span onClick={this.handleCloseClick}>
              <CloseWindowSVG />
            </span>
          </div>}
        <section className="wrapper">
          <span className="window-title">About</span>

          <img src="/static/app-icon.png" />

          <h1>Now</h1>
          <h2>
            Version
            {' '}
            {appVersion ? <b>{appVersion}</b> : ''}
            {' '}
            {this.state && this.state.lastReleaseDate}
          </h2>

          {this.updateStatus}

          <article>
            <h1>Authors</h1>

            <p>
              <a href="https://twitter.com/notquiteleo" onClick={this.openLink}>
                Leo Lamprecht
              </a>
              <br />
              <a href="https://twitter.com/evilrabbit_" onClick={this.openLink}>
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
            <Licenses />
          </article>

          <span className="copyright">
            Made by <a href="https://zeit.co" onClick={this.openLink}>ZEIT</a>
          </span>

          <nav>
            <a href="https://zeit.co/docs" onClick={this.openLink}>Docs</a>
            <a
              href="https://github.com/zeit/now-desktop"
              onClick={this.openLink}
            >
              Source
            </a>
            <a onClick={this.handleTutorial}>Tutorial</a>
          </nav>
        </section>

        <style jsx>{mainStyles}</style>
        <style jsx global>{globalStyles}</style>
      </div>
    )
  }
}

export default About
