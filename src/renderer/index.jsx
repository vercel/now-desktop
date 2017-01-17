// Packages
import {remote, shell} from 'electron'
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'
import SVGinline from 'react-svg-inline'
import timeAgo from 'time-ago'

// Ours
import pkg from '../../app/package'
import showError from './utils/error'
import tokenFromCLI from './utils/token/from-cli'

import Title from './components/title'
import Login from './components/login'
import Binary from './components/binary'

import logoSVG from './vectors/logo'
import arrowSVG from './vectors/arrow'
import updatedSVG from './vectors/updated'
import closeWindowSVG from './vectors/close-window'
import minimizeWindowSVG from './vectors/minimize-window'
import maximizeWindowSVG from './vectors/maximize-window'

const anchorWelcome = document.querySelector('#welcome-to-now > div')
const anchorAbout = document.querySelector('#about-now > div')

const isPlatform = name => {
  let handle

  switch (name) {
    case 'windows':
      handle = 'Windows'
      break
    case 'macOS':
      handle = 'Mac'
      break
    default:
      handle = name
  }

  return new RegExp(handle).test(navigator.userAgent)
}

const SliderArrows = React.createClass({
  render() {
    return (
      <div {...this.props}>
        <SVGinline svg={arrowSVG} width="20px"/>
      </div>
    )
  }
})

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  draggable: false,
  accessibility: false,
  nextArrow: <SliderArrows direction="next"/>,
  prevArrow: <SliderArrows direction="prev"/>,
  afterChange(index) {
    const input = window.loginInput
    const inputElement = window.loginInputElement
    const video = window.usageVideo

    if (!input || !video) {
      return
    }

    const slider = document.querySelector('.slick-track')
    const slideCount = slider.childElementCount

    // If it's the last slide, auto-focus on input
    if (inputElement && input) {
      if (index === slideCount - 1) {
        inputElement.focus()
      } else if (!input.state.classes.includes('verifying')) {
        // Reset value of login form if not verifying
        input.setState(input.getInitialState())
      }
    }

    if (index === 1) {
      video.play()
    } else {
      setTimeout(() => {
        video.pause()
        video.currentTime = 0
      }, 500)
    }
  }
}

const Sections = React.createClass({
  getInitialState() {
    return {
      loginShown: true,
      loginText: 'To start using the app, simply enter\nyour email address below.',
      tested: false
    }
  },
  handleReady() {
    const currentWindow = remote.getCurrentWindow()
    const aboutWindow = remote.getGlobal('about')

    // Close the tutorial
    currentWindow.emit('open-tray', aboutWindow)
  },
  handleMinimizeClick() {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.minimize()
  },
  handleCloseClick() {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.close()
  },
  alreadyLoggedIn() {
    const Config = remote.require('electron-config')
    const config = new Config()

    if (config.has('now.user')) {
      this.setState({
        tested: true,
        loginShown: false,
        loginText: '<b>You\'re already logged in!</b>\nClick here to go back to the application:'
      })

      return
    }

    this.setState({
      tested: true
    })
  },
  arrowKeys(event) {
    const keyCode = event.keyCode
    const slider = this.slider
    const loginInputElement = window.loginInputElement

    if (document.activeElement === loginInputElement) {
      if (keyCode === 27) { // esc
        // This is necessary because on Windows and Linux
        // you can't blur the input element by clicking
        // outside of it
        loginInputElement.blur()
      }
      // We return here to allow the user to move
      // in the input text with the arrows
      return
    }

    switch (keyCode) {
      case 37:
        slider.slickPrev()
        break
      case 39:
        slider.slickNext()
        break
      default:
        return
    }

    event.preventDefault()
  },
  componentDidMount() {
    this.alreadyLoggedIn()
    document.addEventListener('keydown', this.arrowKeys, false)
  },
  render() {
    const videoSettings = {
      preload: true,
      loop: true,
      src: '../assets/usage.webm',
      ref: c => {
        window.usageVideo = c
      }
    }

    const loginTextRef = element => {
      window.loginText = element
    }

    if (this.state.loginShown && this.state.tested) {
      tokenFromCLI(this)
    }

    const setRef = c => {
      this.slider = c
    }

    return (
      <div>
        {isPlatform('windows') && <div className="window-controls">
          <SVGinline onClick={this.handleMinimizeClick} svg={minimizeWindowSVG}/>
          <SVGinline svg={maximizeWindowSVG}/>
          <SVGinline onClick={this.handleCloseClick} svg={closeWindowSVG}/>
        </div>}
        <Slider {...sliderSettings} ref={setRef}>
          <section id="intro">
            <SVGinline svg={logoSVG} width="90px"/>

            <h1>
              <b>Now</b> &mdash; Realtime global deployments
            </h1>
          </section>

          <section id="usage">
            <video {...videoSettings}/>
          </section>

          <section id="cli">
            <Binary/>
          </section>

          <section id="login">
            <p ref={loginTextRef} dangerouslySetInnerHTML={{__html: this.state.loginText}}/>
            {this.state.loginShown ? <Login/> : <a onClick={this.handleReady} className="button">Get Started</a>}
          </section>
        </Slider>
      </div>
    )
  }
})

const mainStyles = {
  height: 'inherit'
}

if (anchorWelcome) {
  ReactDOM.render((
    <main style={mainStyles}>
      <Title/>
      <Sections/>
    </main>
  ), anchorWelcome)
}

const AboutContent = React.createClass({
  getInitialState() {
    return {
      licenses: [],
      lastReleaseDate: ''
    }
  },
  async loadLicenses() {
    const links = document.querySelectorAll('a')

    for (const link of links) {
      const url = link.href

      if (url) {
        link.addEventListener('click', event => {
          shell.openExternal(url)
          event.preventDefault()
        })
      }
    }

    const getLicenses = remote.require('load-licenses')
    const mainModule = remote.process.mainModule

    this.setState({
      licenses: getLicenses(mainModule)
    })

    await this.lastReleaseDate()
  },
  async lastReleaseDate() {
    let data

    try {
      data = await fetch('https://api.github.com/repos/zeit/now-desktop/releases')
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
      if (release.tag_name === pkg.version) {
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
  },
  async componentDidMount() {
    await this.loadLicenses()
  },
  handleTutorial() {
    const tutorial = remote.getGlobal('tutorial')

    if (!tutorial) {
      showError('Not able to open tutorial window')
      return
    }

    tutorial.reload()

    tutorial.on('ready-to-show', () => {
      tutorial.show()
    })
  },
  handleCloseClick() {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.close()
  },
  prepareLicense(info) {
    let element = '<details>'

    element += `<summary>${info.name}</summary>`
    element += `<p>${info.license}</p>`
    element += '</details>'

    return element
  },
  readLicenses() {
    const licenses = this.state.licenses

    if (licenses.length === 0) {
      return ''
    }

    let elements = ''

    for (const license of licenses) {
      elements += this.prepareLicense(license)
    }

    return elements
  },
  updateStatus() {
    const isDev = remote.require('electron-is-dev')

    if (isDev) {
      return (
        <h2 className="update development">
          {'You\'re in development mode. No updates!'}
        </h2>
      )
    }

    return (
      <h2 className="update latest">
        <SVGinline svg={updatedSVG} width="13px"/>
        {'You\'re running the latest version!'}
      </h2>
    )
  },
  render() {
    return (
      <div>
        {isPlatform('windows') && <div className="window-controls">
          <SVGinline onClick={this.handleCloseClick} svg={closeWindowSVG}/>
        </div>}
        <section id="about">
          <span className="window-title">About</span>

          <img src="../dist/icons/icon.ico"/>

          <h1>Now</h1>
          <h2>Version <b>{pkg.version}</b> {this.state.lastReleaseDate}</h2>

          {this.updateStatus()}

          <article>
            <h1>Authors</h1>

            <p>
              <a href="https://twitter.com/notquiteleo">Leo Lamprecht</a><br/>
              <a href="https://twitter.com/evilrabbit_">Evil Rabbit</a><br/>
              <a href="https://twitter.com/rauchg">Guillermo Rauch</a>
            </p>

            <h1>{'3rd party software'}</h1>
            <section dangerouslySetInnerHTML={{__html: this.readLicenses()}}/>
          </article>

          <span className="copyright">Made by <a href="https://zeit.co">ZEIT</a></span>

          <nav>
            <a href="https://zeit.co/now">Docs</a>
            <a href="https://github.com/zeit/now-desktop">Source</a>
            <a onClick={this.handleTutorial}>Tutorial</a>
          </nav>
        </section>
      </div>
    )
  }
})

if (anchorAbout) {
  ReactDOM.render(<AboutContent/>, anchorAbout)
}
