// Native
import { platform } from 'os';

// Packages
import React from 'react';
import Slider from 'react-slick';
import Head from 'next/head';

// Helpers
import remote from '../utils/electron';
import tokenFromCLI from '../utils/token/from-cli';

// Vectors
import ArrowSVG from '../vectors/arrow';
import MaximizeSVG from '../vectors/maximize-window';
import MinimizeSVG from '../vectors/minimize-window';
import CloseSVG from '../vectors/close-window';
import LogoSVG from '../vectors/logo';

// Components
import Title from '../components/title';
import Login from '../components/login';
import Binary from '../components/binary';

const SliderArrows = React.createClass({
  render() {
    return (
      <div {...this.props}>
        <ArrowSVG width="20px" />
      </div>
    );
  }
});

const sliderSettings = {
  speed: 500,
  infinite: false,
  dots: true,
  draggable: false,
  accessibility: false,
  nextArrow: <SliderArrows direction="next" />,
  prevArrow: <SliderArrows direction="prev" />,
  afterChange(index) {
    const input = window.loginInput;
    const inputElement = window.loginInputElement;
    const video = window.usageVideo;

    if (!input || !video) {
      return;
    }

    const slider = document.querySelector('.slick-track');
    const slideCount = slider.childElementCount;

    // If it's the last slide, auto-focus on input
    if (inputElement && input) {
      if (index === slideCount - 1) {
        inputElement.focus();
      } else if (!input.state.classes.includes('verifying')) {
        // Reset value of login form if not verifying
        input.setState(input.getInitialState());
      }
    }

    if (index === 1) {
      video.play();
    } else {
      setTimeout(
        () => {
          video.pause();
          video.currentTime = 0;
        },
        500
      );
    }
  }
};

const Sections = React.createClass({
  getInitialState() {
    return {
      loginShown: true,
      loginText: 'To start using the app, simply enter\nyour email address below.',
      tested: false
    };
  },
  handleReady() {
    const currentWindow = remote.getCurrentWindow();
    const aboutWindow = remote.getGlobal('about');

    // Close the tutorial
    currentWindow.emit('open-tray', aboutWindow);
  },
  handleMinimizeClick() {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.minimize();
  },
  handleCloseClick() {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.close();
  },
  alreadyLoggedIn() {
    const Config = remote.require('electron-config');
    const config = new Config();

    if (config.has('now.user')) {
      this.setState({
        tested: true,
        loginShown: false,
        loginText: "<b>You're already logged in!</b>\nClick here to go back to the application:"
      });

      return;
    }

    this.setState({
      tested: true
    });
  },
  arrowKeys(event) {
    const keyCode = event.keyCode;
    const slider = this.slider;
    const loginInputElement = window.loginInputElement;

    if (document.activeElement === loginInputElement) {
      if (keyCode === 27) {
        // ESC
        // This is necessary because on Windows and Linux
        // you can't blur the input element by clicking
        // outside of it
        loginInputElement.blur();
      }

      // We return here to allow the user to move
      // in the input text with the arrows
      return;
    }

    switch (keyCode) {
      case 37:
        slider.slickPrev();
        break;
      case 39:
        slider.slickNext();
        break;
      default:
        return;
    }

    event.preventDefault();
  },
  componentDidMount() {
    this.alreadyLoggedIn();
    document.addEventListener('keydown', this.arrowKeys, false);
  },
  render() {
    const isWin = platform() === 'win32';
    const fileName = isWin ? 'usage-win.webm' : 'usage.webm';
    const videoStyle = isWin ? { width: '80%' } : {};

    const videoSettings = {
      preload: true,
      loop: true,
      src: `/static/${fileName}`,
      style: videoStyle,
      ref: c => {
        window.usageVideo = c;
      }
    };

    const loginTextRef = element => {
      window.loginText = element;
    };

    if (this.state.loginShown && this.state.tested) {
      tokenFromCLI(this);
    }

    const setRef = c => {
      this.slider = c;
    };

    return (
      <div>
        {platform() === 'win32' &&
          <div className="window-controls">
            <MinimizeSVG onClick={this.handleMinimizeClick} />
            <MaximizeSVG />
            <CloseSVG onClick={this.handleCloseClick} />
          </div>}
        <Slider {...sliderSettings} ref={setRef}>
          <section id="intro">
            <LogoSVG width="90px" />

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
            {this.state.loginShown
              ? <Login />
              : <a className="button" onClick={this.handleReady}>
                  Get Started
                </a>}
          </section>
        </Slider>
      </div>
    );
  }
});

const Tutorial = () => (
  <main>
    <Head>
      <link rel="stylesheet" href="/static/app.css" />
    </Head>

    <Title />
    <Sections />

    <style jsx>
      {
        `
      main {
        height: 'inherit';
      }
    `
      }
    </style>
  </main>
);

export default Tutorial;
