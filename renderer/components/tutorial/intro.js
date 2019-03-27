import { PureComponent } from 'react'
import { func } from 'prop-types'
import introStyles from '../../styles/components/tutorial/intro'
import Logo from '../../vectors/logo'
import { getConfig } from '../../utils/ipc'
import LoginForm from './login'
import CLI from './cli'
import Button from './button'

class Intro extends PureComponent {
  state = {
    sendingMail: false,
    security: null,
    done: false,
    tested: false,
    checked: true
  }

  setState = this.setState.bind(this)
  startTutorial = this.moveSlider.bind(this, 1)

  async loggedIn() {
    if (!this.remote) {
      return
    }

    try {
      await getConfig()
    } catch (err) {
      return false
    }

    return true
  }

  onCheckboxChange = event => {
    this.setState({
      checked: event.target.checked
    })
  }

  showApp = event => {
    event.preventDefault()

    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()

    // Show the event feed
    currentWindow.emit('open-tray')
  }

  moveSlider(index) {
    if (!this.props.moveSlider) {
      return
    }

    this.props.moveSlider(index)
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

  async componentDidUpdate(prevProps, prevState) {
    if (!this.props.setLoggedIn) {
      return
    }

    if (!prevState.done && this.state.done) {
      // This event will simply land in the void if the
      // binary is already installed
      // Let the parent components know that the user
      // is now logged in
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
            <span className="sending-status">
              <i>.</i>
              <i>.</i>
              <i>.</i>
            </span>
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
          <p>
            <b>{"You're already logged in!"}</b>
          </p>

          <p className="has-mini-spacing">
            If you want to learn again how to take advantage of this
            application, simply click the button below:
          </p>

          <Button onClick={this.startTutorial}>Repeat Tutorial</Button>
          <span className="sub" onClick={this.showApp}>
            Show Event Feed
          </span>

          <style jsx>{introStyles}</style>
        </article>
      )
    }

    if (done) {
      return (
        <article>
          <p>
            Congrats, <strong>{"you're now signed in!"}</strong>
          </p>

          <p className="has-mini-spacing">
            To learn more about how to take advantage of this application,
            simply click the button right below:
          </p>

          <Button onClick={this.startTutorial}>Start Tutorial</Button>

          <span className="sub" onClick={this.showApp}>
            Skip Intro
          </span>
          <style jsx>{introStyles}</style>
        </article>
      )
    }

    return (
      <article className="intro-content">
        <Logo />
        <p className="has-spacing">
          To start using the app, simply enter your email address below:
        </p>
        <LoginForm setIntroState={this.setState} />
        <CLI
          checked={this.state.checked}
          onCheckboxChange={this.onCheckboxChange}
        />
        <style jsx>{introStyles}</style>
      </article>
    )
  }
}

Intro.propTypes = {
  setLoggedIn: func,
  moveSlider: func
}

export default Intro
