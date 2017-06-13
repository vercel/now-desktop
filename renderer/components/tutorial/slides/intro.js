// Packages
import React, { PureComponent } from 'react'

// Components
import LoginForm from '../form'
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
  }

  renderDescription() {
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
          <style jsx>{introStyles}</style>
        </article>
      )
    }

    return (
      <article>
        <Logo />
        <p>To start using the app, simply enter your email address below.</p>
        <LoginForm setIntroState={this.setState.bind(this)} />

        <style jsx>{introStyles}</style>
      </article>
    )
  }

  render() {
    return (
      <div>
        {this.renderDescription()}

        <style jsx global>
          {`
            .sending-status i {
              font-weight: 700;
              font-style: normal;
              animation-name: blink;
              animation-duration: 1.4s;
              animation-iteration-count: infinite;
              animation-fill-mode: both;
              font-size: 150%;
            }
            .sending-status i:nth-child(3) {
              animation-delay: .2s;
            }
            .sending-status i:nth-child(4) {
              animation-delay: .4s;
            }
            .security-token {
              display: block;
              margin-top: 35px;
              background: #CCCCCC;
              color: #000;
              border-radius: 3px;
              font-weight: normal;
              padding: 10px;
              font-weight: 700;
              font-size: 13px;
              letter-spacing: 0.15em;
            }
            @keyframes blink {
              0% {
                opacity: 0.1;
              }
              20% {
                opacity: 1;
              }
              100% {
                opacity: .2;
              }
            }
          `}
        </style>
      </div>
    )
  }
}

export default Intro
