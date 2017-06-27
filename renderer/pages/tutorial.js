// Native
import { platform } from 'os'

// Packages
import electron from 'electron'
import React from 'react'
import Slider from 'react-slick'
import setRef from 'react-refs'

// Vectors
import MinimizeSVG from '../vectors/minimize-window'
import CloseSVG from '../vectors/close-window'

// Components
import Title from '../components/title'
import CLI from '../components/tutorial/cli'
import Intro from '../components/tutorial/intro'
import SliderArrow from '../components/tutorial/arrow'
import Video from '../components/tutorial/video'

// Styles
import { sliderStyle, wrapStyle, controlStyle } from '../styles/pages/tutorial'

class Sections extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loggedIn: false,
      index: 0
    }

    this.remote = electron.remote || false
    this.setReference = setRef.bind(this)
    this.isWindows = platform() === 'win32'

    this.handleCloseClick = this.handleCloseClick.bind(this)
    this.handleMinimizeClick = this.handleMinimizeClick.bind(this)
    this.arrowKeys = this.arrowKeys.bind(this)
    this.setLoggedIn = this.setLoggedIn.bind(this)
    this.sliderChanged = this.sliderChanged.bind(this)
  }

  sliderChanged(index) {
    const input = window.loginInput
    const inputElement = window.loginInputElement

    if (!input) {
      return
    }

    // If it's the last slide, auto-focus on input
    if (inputElement && input) {
      if (index === 0) {
        inputElement.focus()
      } else if (!input.state.classes.includes('verifying')) {
        // Reset value of login form if not verifying
        input.resetState()
      }
    }

    this.setState({ index })
  }

  setLoggedIn(loggedIn) {
    this.setState({ loggedIn })
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

  arrowKeys(event) {
    const keyCode = event.keyCode
    const slider = this.slider
    const loginInputElement = window.loginInputElement

    // Prevent user from tabbing through the inputs
    // This leads to an unusable UI
    if (keyCode === 9) {
      event.preventDefault()
      return
    }

    if (document.activeElement.tagName === 'INPUT') {
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
    document.addEventListener('keydown', this.arrowKeys, false)

    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()

    currentWindow.on('close', async () => {
      if (this.slider) {
        this.slider.slickGoTo(0)
      }
    })
  }

  render() {
    const loggedIn = this.state.loggedIn
    const index = this.state.index

    const sliderSettings = {
      speed: 500,
      infinite: false,
      draggable: false,
      accessibility: false,
      nextArrow: <SliderArrow direction="next" />,
      prevArrow: <SliderArrow direction="prev" />,
      afterChange: this.sliderChanged,
      arrows: loggedIn,
      dots: loggedIn
    }

    return (
      <div>
        {this.isWindows &&
          <div className="window-controls">
            <span onClick={this.handleMinimizeClick}>
              <MinimizeSVG />
            </span>

            <span onClick={this.handleCloseClick}>
              <CloseSVG />
            </span>
          </div>}
        <Slider {...sliderSettings} ref={this.setReference} name="slider">
          <section>
            <Intro setLoggedIn={this.setLoggedIn} />
          </section>

          <section>
            <CLI />
          </section>

          <section>
            <Video slider={this.slider} playing={index === 2} />
          </section>
        </Slider>

        <style jsx>{controlStyle}</style>
      </div>
    )
  }
}

const Tutorial = () =>
  <main>
    <Title>Welcome to Now</Title>
    <Sections />

    <style jsx>{wrapStyle}</style>
    <style jsx global>{sliderStyle}</style>
  </main>

export default Tutorial
