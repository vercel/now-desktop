// Native
import { platform } from 'os'

// Packages
import electron from 'electron'
import React from 'react'
import Slider from 'react-slick'

// Helpers
import tokenFromCLI from '../utils/token/from-cli'

// Vectors
import ArrowSVG from '../vectors/arrow'
import MinimizeSVG from '../vectors/minimize-window'
import CloseSVG from '../vectors/close-window'
import LogoSVG from '../vectors/logo'

// Components
import Title from '../components/title'
import Login from '../components/tutorial/login'
import Binary from '../components/tutorial/binary'

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

class Sections extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = initialState
    this.remote = electron.remote || false
  }

  handleReady() {
    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
    const windows = this.remote.getGlobal('windows')

    if (!windows || !windows.about) {
      return
    }

    // Close the tutorial
    currentWindow.emit('open-tray', windows.about)
  }

  handleMinimizeClick() {
    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
    currentWindow.minimize()
  }

  handleCloseClick() {
    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()
    currentWindow.hide()
  }

  async loggedIn() {
    if (!this.remote) {
      return
    }

    const { getConfig } = this.remote.require('./utils/config')

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
        loginText:
          "<b>You're already logged in!</b>\nClick here to go back to the application:"
      })
    } else {
      this.setState({
        tested: true
      })
    }

    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()

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
            <span onClick={this.handleMinimizeClick.bind(this)}>
              <MinimizeSVG />
            </span>

            <span onClick={this.handleCloseClick.bind(this)}>
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
              : <a className="button" onClick={this.handleReady.bind(this)}>
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

const Tutorial = () =>
  <main>
    <Title>Welcome to Now</Title>
    <Sections />

    <style jsx>
      {`
        main {
          color: #000;
          background: #fff;
          height: 100vh;
          width: 100vw;
        }
      `}
    </style>

    <style jsx global>
      {`
        body {
          margin: 0;
          font-family: -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Helvetica Neue,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -webkit-app-region: drag;
        }
        ::selection {
          background: #A7D8FF;
        }
        .slick-slider {
          position: relative;
          display: block;
          box-sizing: border-box;
          user-select: none;
          -webkit-touch-callout: none;
          touch-action: pan-y;
          -webkit-tap-highlight-color: transparent;
        }
        .slick-list {
          position: relative;
          display: block;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        .slick-list:focus {
          outline: none;
        }
        .slick-list.dragging {
          cursor: pointer;
          cursor: hand;
        }
        .slick-slider .slick-track, .slick-slider .slick-list {
          transform: translate3d(0, 0, 0);
        }
        .slick-track {
          position: relative;
          top: 0;
          left: 0;
          display: block;
        }
        .slick-track:before, .slick-track:after {
          display: table;
          content: '';
        }
        .slick-track:after {
          clear: both;
        }
        .slick-loading .slick-track {
          visibility: hidden;
        }
        .slick-slide {
          display: none;
          float: left;
          height: 100%;
          min-height: 1px;
        }
        [dir='rtl'] .slick-slide {
          float: right;
        }
        .slick-slide img {
          display: block;
        }
        .slick-slide.slick-loading img {
          display: none;
        }
        .slick-slide.dragging img {
          pointer-events: none;
        }
        .slick-initialized .slick-slide {
          display: block;
        }
        .slick-loading .slick-slide {
          visibility: hidden;
        }
        .slick-vertical .slick-slide {
          display: block;
          height: auto;
          border: 1px solid transparent;
        }
        .slick-arrow.slick-hidden {
          display: none;
        }
        .slick-initialized .slick-slide {
          height: 100vh;
          justify-content: center;
          align-items: center;
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .slick-arrow {
          height: 100vh !important;
          z-index: 4000;
          top: 0;
          position: fixed;
          width: 50px !important;
          display: flex !important;
          justify-content: center;
          align-items: center;
          background: linear-gradient(to left, #000, transparent);
          cursor: pointer;
          opacity: 0;
          transition: opacity .3s ease;
          -webkit-app-region: no-drag;
        }
        .slick-arrow:not(.slick-disabled) {
          opacity: .5 !important;
        }
        .slick-arrow:not(.slick-disabled):hover {
          opacity: 1 !important;
        }
        .slick-arrow.slick-prev {
          left: 0;
          transform: rotate(180deg);
        }
        .slick-arrow.slick-next {
          right: 0;
        }
        .slick-dots {
          margin: 0;
          padding: 0;
          position: fixed;
          display: flex !important;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          justify-content: center;
          align-items: center;
          list-style: none;
          z-index: 100;
        }
        .slick-dots li {
          display: block;
          -webkit-app-region: no-drag;
          margin: 0 4px;
        }
        .slick-dots li button {
          display: block;
          height: 10px;
          width: 10px;
          background: #fff;
          border: 0;
          text-indent: -999px;
          border-radius: 100%;
          padding: 0;
          opacity: .5;
          cursor: pointer;
          transition: opacity .4s;
        }
        .slick-dots li button:focus {
          outline: 0;
        }
        .slick-dots li button:hover, .slick-dots li.slick-active button {
          opacity: 1;
        }
      `}
    </style>
  </main>

export default Tutorial
