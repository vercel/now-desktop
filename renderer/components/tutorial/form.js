// Packages
import electron from 'electron'
import { stringify as stringifyQuery } from 'querystring'
import emailProviders from 'email-providers/common'
import AutoSizeInput from 'react-input-autosize'
import React, { PureComponent } from 'react'
import sleep from 'sleep-promise'

// Ours
import error from '../../utils/error'

class LoginForm extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      value: '',
      focus: false,
      classes: [],
      suggestion: '',
      waiting: false
    }

    this.initialState = Object.assign({}, this.state)
    this.remote = electron.remote || false
  }

  async verify(url, email, token, remote) {
    const query = {
      email,
      token
    }

    const apiURL = url + '/now/registration/verify?' + stringifyQuery(query)
    const userAgent = remote.require('./utils/user-agent')

    const res = await fetch(apiURL, {
      headers: {
        'user-agent': userAgent
      }
    })

    const body = await res.json()
    return body.token
  }

  async getVerificationData(url, email, remote) {
    const os = remote.require('os')
    const hyphens = new RegExp('-', 'g')
    const host = os.hostname().replace(hyphens, ' ').replace('.local', '')
    const userAgent = remote.require('./utils/user-agent')

    const body = JSON.stringify({
      email,
      tokenName: 'Now on ' + host
    })

    const apiURL = `${url}/now/registration`

    const res = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(body).length,
        'user-agent': userAgent
      },
      body
    })

    if (res.status !== 200) {
      error('Verification error', res.json())
      return
    }

    const content = await res.json()

    return {
      token: content.token,
      securityCode: content.securityCode
    }
  }

  handleChange(event) {
    const value = event.target.value

    this.setState({
      value
    })

    this.prepareSuggestion(value)
  }

  componentWillUnmount() {
    if (!this.apiRequest) {
      return
    }

    this.apiRequest.abort()
  }

  prepareSuggestion(value) {
    if (value === '') {
      return
    }

    const domain = value.match(/@(.*)/)

    if (domain && domain[1].length > 0) {
      const match = domain[1]
      let sug

      // Auto-complete @zeit.co email addresses
      emailProviders.push('zeit.co')

      emailProviders.some(dm => {
        // Don't suggest if complete match
        if (
          match.toLowerCase() === dm.substr(0, match.length) &&
          match !== dm
        ) {
          sug = dm
          return true
        }

        return false
      })

      if (sug) {
        const receiver = value.trim().split('@')[0]
        const suggestion = receiver + '@' + sug

        const suffix = suggestion.replace(value, '')

        this.setState({
          suggestion: '<i>' + value + '</i>' + suffix
        })

        return
      }
    }

    this.setState({
      suggestion: ''
    })
  }

  async tryLogin(email) {
    if (!this.remote) {
      return
    }

    const onlineStatus = this.remote.process.env.CONNECTION

    if (onlineStatus === 'offline') {
      error("You're offline!")
      return
    }

    if (this.state.waiting) {
      return
    }

    this.setState({
      waiting: true
    })

    this.props.intro.setState({
      sendingMail: true
    })

    this.setState({
      classes: ['verifying']
    })

    const apiURL = 'https://api.zeit.co'
    const { token, securityCode } = await this.getVerificationData(
      apiURL,
      email,
      this.remote
    )

    if (!token) {
      this.setState({
        waiting: false
      })

      return
    }

    this.props.intro.setState({
      sendingMail: false,
      securityCode
    })

    let finalToken

    /* eslint-disable no-await-in-loop */
    do {
      await sleep(2500)

      try {
        finalToken = await this.verify(apiURL, email, token, this.remote)
      } catch (err) {}

      console.log('Waiting for token...')
    } while (!finalToken)
    /* eslint-enable no-await-in-loop */

    if (!this.remote) {
      return
    }

    // Also save it to now.json
    const { saveConfig, watchConfig } = this.remote.require('./utils/config')

    // Load the user's data
    const loadData = this.remote.require('./utils/data/load')
    const { API_USER } = this.remote.require('./utils/data/endpoints')
    const userData = await loadData(API_USER, finalToken)
    const user = userData.user

    try {
      await saveConfig({
        user: {
          uid: user.uid,
          username: user.username,
          email: user.email
        },
        token: finalToken
      })
    } catch (err) {
      error('Could not save config', err)
      return
    }

    // Start watching for changes in .now.json
    // This will update the scope in the main window
    watchConfig()

    const remote = electron.remote || false

    if (!remote) {
      return
    }

    const windows = remote.getGlobal('windows')
    const mainWindow = windows.main

    mainWindow.reload()

    mainWindow.once('ready-to-show', async () => {
      if (!this.props.intro) {
        return
      }

      this.props.intro.setState({
        securityCode: null,
        done: true
      })
    })
  }

  async handleKey(event) {
    this.setState({
      classes: []
    })

    const keyCode = event.keyCode

    const isEnter = keyCode === 13
    const initialValue = this.initialState.value

    if (initialValue === this.state.value && !isEnter) {
      this.setState({
        value: ''
      })
    }

    const suggestion = this.state.suggestion

    if (
      suggestion &&
      (keyCode === 39 /* Right */ ||
      keyCode === 9 /* Tab */ ||
        isEnter) /* Enter */
    ) {
      // Strip HTML tags and set value
      this.setState({
        value: suggestion.replace(/(<([^>]+)>)/gi, ''),
        suggestion: ''
      })

      event.preventDefault()
      return
    }

    if (!isEnter || this.state.value === '') {
      return
    }

    const value = this.state.value

    if (!/^.+@.+\..+$/.test(value)) {
      this.setState({
        classes: ['error']
      })

      console.log('Not a valid email')
      return
    }

    // Don't trigger login if placeholder defined as value
    if (value === initialValue) {
      return
    }

    try {
      await this.tryLogin(value)
    } catch (err) {
      error('Not able to retrieve verification token', err)
    }
  }

  toggleFocus() {
    this.setState({
      focus: !this.state.focus
    })

    // If input is empty, bring placeholder back
    if (this.state.focus && this.state.value === '') {
      this.setState({
        value: this.initialState.value
      })
    }
  }

  render() {
    const classes = this.state.classes

    const inputProps = {
      type: 'email',
      value: this.state.value,
      placeholder: 'you@domain.com',
      onChange: this.handleChange.bind(this),
      onKeyDown: this.handleKey.bind(this),
      onFocus: this.toggleFocus.bind(this),
      onBlur: this.toggleFocus.bind(this),
      ref: item => {
        window.loginInputElement = item
        this.loginInput = item
      },
      onClick: event => event.stopPropagation()
    }

    if (classes.indexOf('auto-complete') === -1) {
      classes.push('auto-complete')
    }

    const focusPosition = classes.indexOf('focus')

    if (focusPosition > -1) {
      classes.splice(focusPosition, 1)
    }

    if (this.state.focus) {
      classes.push('focus')
    }

    const autoCompleteProps = {
      ref: () => {
        window.loginInput = this
      },
      onClick: () => this.loginInput.focus(),
      className: classes.join(' ')
    }

    const suggestionClass = this.state.focus ? '' : 'hidden'

    return (
      <div id="login">
        <aside {...autoCompleteProps}>
          <div>
            <AutoSizeInput {...inputProps} />
            <span
              className={suggestionClass}
              dangerouslySetInnerHTML={{ __html: this.state.suggestion }}
            />
          </div>

          <style jsx global>
            {`
              #login input {
                border: 0;
                outline: 0;
                padding: 0;
                background: transparent;
                color: #9B9B9B;
                height: 32px;
                line-height: 32px;
                text-align: left;
                transition: border, background, color .1s ease-in;
                max-width: 380px;
                z-index: 300;
                position: relative;
                font-family: inherit;
                font-size: inherit;
              }
              #login input:focus {
                color: #000;
              }
              #login a {
                margin-top: 30px;
              }
              #login .auto-complete {
                border-bottom-style: solid;
                border-bottom-width: 1px;
                border-bottom-color: #EAEAEA;
                min-width: 300px;
                text-align: center;
                margin-top: 25px;
                transition: all 0.4s ease;
                cursor: text;
                -webkit-app-region: no-drag;
                font-size: 14px;
              }
              #login .auto-complete.focus {
                border-bottom-color: #067DF7;
              }
              #login .auto-complete.verifying {
                display: none;
              }
              #login .auto-complete.error {
                border-bottom-color: #ff286a;
                animation: shake 1s both;
              }
              #login .auto-complete.error input {
                color: #ff286a;
              }
              #login .auto-complete div {
                position: relative;
                display: inline-block;
              }
              #login .auto-complete span {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 100;
                color: #999;
                line-height: 35px;
                text-align: left;
                text-indent: 0px;
                font-family: inherit;
                font-size: inherit;
                margin-top: -2px;
                white-space: nowrap;
              }
              #login .auto-complete span.hidden {
                opacity: 0;
              }
              #login .auto-complete i {
                font-style: normal;
                visibility: hidden;
              }
              #login .sending-status i {
                font-weight: 700;
                font-style: normal;
                animation-name: blink;
                animation-duration: 1.4s;
                animation-iteration-count: infinite;
                animation-fill-mode: both;
                font-size: 150%;
              }
              #login .sending-status i:nth-child(3) {
                animation-delay: .2s;
              }
              #login .sending-status i:nth-child(4) {
                animation-delay: .4s;
              }
              @keyframes shake {
                0%, 100% {
                  transform: translate3d(0, 0, 0);
                }
                10%, 30%, 50%, 70%, 90% {
                  transform: translate3d(-10px, 0, 0);
                }
                20%, 40%, 60%, 80% {
                  transform: translate3d(10px, 0, 0);
                }
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
        </aside>
      </div>
    )
  }
}

export default LoginForm
