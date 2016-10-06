// Packages
import React from 'react'
import ReactDOM from 'react-dom'
import Slider from 'react-slick'
import SVGinline from 'react-svg-inline'
import {remote, shell} from 'electron'
import timeAgo from 'time-ago'

// Ours
import pkg from '../../app/package.json'
import showError from './utils/error'
import tokenFromCLI from './utils/token/from-cli'

import Title from './components/title'
import Login from './components/login'
import Binary from './components/binary'

import logoSVG from './vectors/logo.svg'
import arrowSVG from './vectors/arrow.svg'
import updatedSVG from './vectors/updated.svg'

const anchorWelcome = document.querySelector('#welcome-to-now > div')
const anchorAbout = document.querySelector('#about-now > div')

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
      <Slider {...sliderSettings} ref={setRef}>
        <section id="intro">
          <SVGinline svg={logoSVG} width="90px"/>

          <h1>
            <b>now:</b> realtime global deployments
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
      data = await fetch('https://api.github.com/repos/zeit/now-app/releases/latest')
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

    const ago = timeAgo().ago(new Date(data.published_at))

    this.setState({
      lastReleaseDate: `(${ago})`
    })
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
      <section id="about">
        <span className="window-title">About</span>

        <img src="../dist/app.ico"/>
        <h1>Now.app</h1>

        <h2>Version <b>{pkg.version}</b> {this.state.lastReleaseDate}</h2>

        {this.updateStatus()}

        <article>
          <h1>Authors</h1>
          <p>
            Leo Lamprecht (<a href="https://twitter.com/notquiteleo">@notquiteleo</a>)<br/>
            Evil Rabbit (<a href="https://twitter.com/evilrabbit_">@evilrabbit_</a>)<br/>
            Guillermo Rauch (<a href="https://twitter.com/rauchg">@rauchg</a>)
          </p>

          <h1>{'3rd party software'}</h1>
          <section dangerouslySetInnerHTML={{__html: this.readLicenses()}}/>
        </article>

        <span className="copyright">Made by <b>ZEIT</b></span>

        <nav>
          <a href="https://zeit.co/now">Docs</a>
          <a href="https://github.com/zeit/now-app">Source</a>
          <a onClick={this.handleTutorial}>Tutorial</a>
        </nav>
      </section>
    )
  }
})

if (anchorAbout) {
  ReactDOM.render(<AboutContent/>, anchorAbout)
}
