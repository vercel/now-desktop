// Packages
import React, { PureComponent } from 'react'

// Components
import LoginForm from '../form'
import Logo from '../../../vectors/logo'

class Intro extends PureComponent {
  render() {
    return (
      <article>
        <Logo />
        <p>To start using the app, simply enter your email address below.</p>
        <LoginForm />

        <style jsx>
          {`
            article {
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              height: 300px;
            }
            p {
              font-size: 14px;
              margin: 75px 0 0 0;
            }
          `}
        </style>
      </article>
    )
  }
}

export default Intro
