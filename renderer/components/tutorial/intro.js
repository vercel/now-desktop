// Packages
import electron from 'electron'
import React, { PureComponent } from 'react'
import { func } from 'prop-types'

// Styles
import introStyles from '../../styles/components/tutorial/intro'

// Components
import Logo from '../../vectors/logo'
import LoginForm from './login'
import Button from './button'

class Intro extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      sendingMail: false,
      security: null,
      done: false,
      tested: false
    }

    this.remote = electron.remote || false

    this.setState = this.setState.bind(this)
    this.handleReady = this.handleReady.bind(this)
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

  handleReady(event) {
    event.preventDefault()

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

  async componentWillMount() {
    if (!await this.loggedIn()) {
      return
    }

    this.setState({
      tested: true,
      done: true
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.done && this.state.done) {
      if (!this.props.setLoggedIn) {
        return
      }

      this.props.setLoggedIn(true)
    }
  }

  render() {
    const { sendingMail, security, done, tested } = this.state

    if (sendingMail) {
      return (
        <article>
          <p>
            Sending an email for the verification of your address
            <span className="sending-status"><i>.</i><i>.</i><i>.</i></span>
          </p>

          <style jsx>{introStyles}</style>
        </article>
      )
    }

    if (!sendingMail && security) {
      return (
        <article>
          <p>
            We sent an email to <strong>{security.email}</strong>.<br />
            Please follow the steps provided in it and make sure<br />the
            security token matches this one:
            <b className="security-token">{security.code}</b>
          </p>

          <style jsx>{introStyles}</style>
        </article>
      )
    }

    if (done && tested) {
      return (
        <article>
          <Logo />
          <p className="has-tiny-spacing">
            <b>{"You're already logged in!"}</b><br />Click here to go back to
            the application:
          </p>
          <Button onClick={this.handleReady}>SHOW APP</Button>

          <style jsx>{introStyles}</style>
        </article>
      )
    }

    if (done) {
      return (
        <article>
          <p>
            Congrats! <strong>{"You're signed in."}</strong><br />Are you ready
            to deploy something?
          </p>
          <Button onClick={this.handleReady}>Get Started</Button>

          <style jsx>{introStyles}</style>
        </article>
      )
    }

    return (
      <article>
        <Logo />
        <p className="has-spacing">
          To start using the app, simply enter your email address below.
        </p>
        <LoginForm setIntroState={this.setState} />

        <style jsx>{introStyles}</style>
      </article>
    )
  }
}

Intro.propTypes = {
  setLoggedIn: func
}

export default Intro
