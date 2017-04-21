// Native
import { platform } from 'os'

// Packages
import React, { Component } from 'react'
import Slider from 'react-slick'
import { rendererPreload } from 'electron-routes'

// Helpers
import remote from '../utils/electron'
import tokenFromCLI from '../utils/token/from-cli'

// Vectors
import ArrowSVG from '../vectors/arrow'
import MinimizeSVG from '../vectors/minimize-window'
import CloseSVG from '../vectors/close-window'
import LogoSVG from '../vectors/logo'

// Components
import Title from '../components/title'
import Login from '../components/login'
import Binary from '../components/binary'
import Container from '../components/container'

if (process.type === 'renderer') rendererPreload()

const SliderArrows = props => {
  const properties = Object.assign({}, props)

  const uselessProps = ['currentSlide', 'slideCount']

  for (const prop of uselessProps) {
    delete properties[prop]
  }

  return (
    <div {...properties}>
      <ArrowSVG />
    </div>
  )
}

const initialState = {
  loginShown: true,
  loginText: 'To start using the app, simply enter\nyour email address below.',
  tested: false
}

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  draggable: false,
  accessibility: false,
  nextArrow: <SliderArrows direction="next" />,
  prevArrow: <SliderArrows direction="prev" />,
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
        input.setState(initialState)
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

class Sections extends Component {
  constructor(props) {
    super(props)
    this.state = initialState
  }

  handleReady() {
    const currentWindow = remote.getCurrentWindow()
    const windows = remote.getGlobal('windows')

    if (!windows || !windows.about) {
      return
    }

    // Close the tutorial
    currentWindow.emit('open-tray', windows.about)
  }

  handleMinimizeClick() {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.minimize()
  }

  handleCloseClick() {
    const currentWindow = remote.getCurrentWindow()
    currentWindow.hide()
  }

  async loggedIn() {
    const { get: getConfig } = remote.require('./utils/config')

    try {
      await getConfig()
    } catch (err) {
      return false
    }

    return true
  }

  arrowKeys(event) {
    const keyCode = event.keyCode
    const slider = this.slider
    const loginInputElement = window.loginInputElement

    if (document.activeElement === loginInputElement) {
      if (keyCode === 27) {
        // ESC
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
  }

  async componentDidMount() {
    // Make arrow keys work for navigating slider
    document.addEventListener('keydown', this.arrowKeys.bind(this), false)

    // Check if already logged in
    const loggedIn = await this.loggedIn()

    if (loggedIn) {
      this.setState({
        tested: true,
        loginShown: false,
        loginText: "<b>You're already logged in!</b>\nClick here to go back to the application:"
      })
    } else {
      this.setState({
        tested: true
      })
    }

    const currentWindow = remote.getCurrentWindow()

    currentWindow.on('close', async () => {
      // Don't reset slider if logged out
      // If the user enters some details and hides
      // the window for some time, we don't want the
      // slider to flick away
      if (!await this.loggedIn()) {
        return
      }

      if (this.slider) {
        this.slider.slickGoTo(0)
      }
    })
  }

  render() {
    const isWin = platform() === 'win32'
    const fileName = isWin ? 'usage-win.webm' : 'usage.webm'
    const videoStyle = isWin ? { width: '80%' } : {}

    const videoSettings = {
      preload: true,
      loop: true,
      src: `/static/${fileName}`,
      style: videoStyle,
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
        {platform() === 'win32' &&
          <div className="window-controls">
            <span onClick={this.handleMinimizeClick}>
              <MinimizeSVG />
            </span>

            <span onClick={this.handleCloseClick}>
              <CloseSVG />
            </span>
          </div>}
        <Slider {...sliderSettings} ref={setRef.bind(this)}>
          <section id="intro">
            <LogoSVG />

            <h1>
              <b>Now</b> — Realtime global deployments
            </h1>
          </section>

          <section id="usage">
            <video {...videoSettings} />
          </section>

          <section id="cli">
            <Binary />
          </section>

          <section id="login">
            <p
              ref={loginTextRef}
              dangerouslySetInnerHTML={{ __html: this.state.loginText }}
            />
            {this.state && this.state.loginShown
              ? <Login />
              : <a className="button" onClick={this.handleReady}>
                  Get Started
                </a>}
          </section>
        </Slider>

        <style jsx>
          {`
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
              transition: all .2s ease;
              cursor: pointer;
              display: inline-block;
              line-height: normal;
              -webkit-app-region: no-drag;
            }

            a {
              -webkit-app-region: no-drag;
            }

            .button:hover {
              background: #fff;
              color: #000;
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

            #intro h1 {
              font-size: 15px;
              font-weight: 400;
              margin: 25px 0 0 0;
              cursor: default;
            }

            #usage video {
              width: 582px;
              position: relative;
              z-index: 0;
            }

            #login p {
              text-align: center;
              margin: 0;
              font-size: 15px;
              line-height: 24px;
              white-space: pre;
            }

            #login a {
              margin-top: 30px;
            }
        `}
        </style>
      </div>
    )
  }
}

const Tutorial = () => (
  <Container>
    <main>
      <Title>Welcome to Now</Title>
      <Sections />

      <style jsx>
        {`
        main {
          color: #fff;
          background: #000;
          height: 100vh;
          width: 100vw;
        }
      `}
      </style>
    </main>
  </Container>
)

export default Tutorial
