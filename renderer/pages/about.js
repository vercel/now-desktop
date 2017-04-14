// Native
import { platform } from 'os'

// Packages
import React, { Component } from 'react'
import timeAgo from 'time-ago'
import { rendererPreload } from 'electron-routes'
import isDev from 'electron-is-dev'

// Vectors
import CloseWindowSVG from '../vectors/close-window'
import UpdatedSVG from '../vectors/updated'

// Components
import Container from '../components/container'
import Licenses from '../components/licenses'

// Helpers
import showError from '../utils/error'
import remote from '../utils/electron'

if (process.type === 'renderer') rendererPreload()

const getAppVersion = () => {
  if (isDev) {
    return remote.process.env.npm_package_version
  }

  return remote.app.getVersion()
}

const openLink = event => {
  const link = event.target

  remote.shell.openExternal(link.href)
  event.preventDefault()
}

class About extends Component {
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
      if (release.tag_name === getAppVersion()) {
        localRelease = release
      }
    }

    if (!localRelease) {
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
    const tutorial = remote.getGlobal('tutorial')

    if (!tutorial) {
      showError('Not able to open tutorial window')
      return
    }

    tutorial.show()
  }

  handleCloseClick() {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.hide()
  }

  updateStatus() {
    const isDev = remote.require('electron-is-dev')

    return (
      <div>
        {isDev
          ? <h2 className="update development">
              {"You're in development mode. No updates!"}
            </h2>
          : <h2 className="update latest">
              <UpdatedSVG onClick={this.handleCloseClick} />
              {"You're running the latest version!"}
            </h2>}

        <style jsx>
          {`
          .update {
            font-size: 11px;
            margin-top: 5px;
            display: none;
          }

          .update.latest {
            color: #00A819;
          }

          .update.latest span {
            cursor: default;
          }

          .update.latest svg {
            margin-bottom: -3px;
            margin-right: 5px;
          }

          .update.development {
            color: #0080c1;
          }
        `}
        </style>
      </div>
    )
  }

  render() {
    return (
      <Container>
        <div>
          {platform() === 'win32' &&
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
              <b>{getAppVersion()}</b>
              {' '}
              {this.state && this.state.lastReleaseDate}
            </h2>

            {this.updateStatus()}

            <article>
              <h1>Authors</h1>

              <p>
                <a href="https://twitter.com/notquiteleo" onClick={openLink}>
                  Leo Lamprecht
                </a>
                <br />
                <a href="https://twitter.com/evilrabbit_" onClick={openLink}>
                  Evil Rabbit
                </a>
                <br />
                <a href="https://twitter.com/rauchg" onClick={openLink}>
                  Guillermo Rauch
                </a>
                <br />
                <a href="https://twitter.com/matheusfrndes" onClick={openLink}>
                  Matheus Fernandes
                </a>
              </p>

              <h1>{'3rd party software'}</h1>
              <Licenses />
            </article>

            <span className="copyright">
              Made by <a href="https://zeit.co" onClick={openLink}>ZEIT</a>
            </span>

            <nav>
              <a href="https://zeit.co/docs" onClick={openLink}>Docs</a>
              <a href="https://github.com/zeit/now-desktop" onClick={openLink}>
                Source
              </a>
              <a onClick={this.handleTutorial}>Tutorial</a>
            </nav>
          </section>

          <style jsx>
            {`
            div {
              background: #ECECEC;
              height: 100vh;
            }

            .window-controls {
              display: flex;
              justify-content: flex-end;
              position: fixed;
              right: 0;
              top: 0;
              left: 0;
              height: 10px;
              padding: 10px;
              z-index: 5000; /* the slick arrow is at 4000 */
              background: transparent;
            }

            .window-controls span {
              opacity: .5;
              font-size: 0;
              display: block;
              -webkit-app-region: no-drag;
              margin-left: 10px;
            }

            .window-controls span:hover {
              opacity: 1;
            }

            a {
              -webkit-app-region: no-drag;
            }

            .wrapper {
              text-align: center;
              padding-top: 40px;
              color: #434343;
            }

            img {
              width: 100px;
            }

            h1,
            h2 {
              margin: 0;
            }

            h1 {
              font-size: 15px;
              font-weight: 700;
              margin: 5px 0 15px 0;
            }

            h2 {
              font-size: 12px;
              font-weight: 400;
              cursor: default;
            }

            h2 span {
              color: #5319e7;
              cursor: pointer;
            }

            .window-title {
              font-size: 12px;
              color: #434343;
              text-align: center;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 37px;
              line-height: 37px;
            }

            article {
              background: #fff;
              border-top: 1px solid #BFBFBF;
              border-bottom: 1px solid #BFBFBF;
              height: 135px;
              text-align: left;
              padding: 15px;
              box-sizing: border-box;
              overflow-y: scroll;
              -webkit-app-region: no-drag;
              -webkit-user-select: text;
              margin-top: 20px;
            }

            article h1,
            article p {
              color: #707070;
              font-size: 11px;
            }

            article h1 {
              text-transform: uppercase;
              margin-top: 15px;
            }

            article h1:first-child {
              margin-top: 0;
            }

            article p {
              line-height: 19px;
            }

            article a {
              color: #707070;
              text-decoration: none;
            }

            article a:hover {
              color: #2b2b2b;
            }

            .copyright {
              font-size: 11px;
              margin-top: 11px;
              display: block;
            }

            .copyright a {
              color: inherit;
              text-decoration: none;
            }

            .copyright a:before {
              content: '\\25B2';
            }

            .copyright a:hover {
              color: #000;
            }

            nav a {
              font-size: 11px;
              color: #434343;
              text-decoration: none;
              padding: 0 10px;
              position: relative;
              cursor: pointer;
            }

            nav a:after {
              content: '';
              position: absolute;
              right: 0;
              width: 1px;
              height: 10px;
              background: #434343;
              top: 2px;
            }

            nav a:hover {
              color: #000;
            }

            nav a:last-child:after {
              display: none;
            }
          `}
          </style>
        </div>
      </Container>
    )
  }
}

export default About
