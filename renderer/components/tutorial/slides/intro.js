// Packages
import electron from 'electron'
import React, { PureComponent } from 'react'

// Components
import LoginForm from '../form'
import Button from '../button'
import Logo from '../../../vectors/logo'

// Styles
import introStyles from '../../../styles/intro'

class Intro extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      sendingMail: false,
      security: null,
      done: false
    }

    this.remote = electron.remote || false
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

  render() {
    const { sendingMail, security, done } = this.state

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

    if (done) {
      return (
        <article>
          <p>
            Congrats! <strong>{"You're signed in."}</strong><br />Are you ready
            to deploy something?
          </p>
          <Button onClick={this.handleReady.bind(this)}>Get Started</Button>

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
        <LoginForm setIntroState={this.setState.bind(this)} />

        <style jsx>{introStyles}</style>
      </article>
    )
  }
}

export default Intro
