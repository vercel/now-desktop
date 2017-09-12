// Packages
import electron from 'electron'
import { stringify as stringifyQuery } from 'querystring'
import AutoSizeInput from 'react-input-autosize'
import React, { PureComponent } from 'react'
import sleep from 'sleep-promise'
import { func } from 'prop-types'

// Utilities
import loadData from '../../utils/data/load'
import { API_USER } from '../../utils/data/endpoints'
import error from '../../utils/error'
import emailProviders from '../../utils/email-providers'

// Styles
import styles from '../../styles/components/tutorial/login'

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
    this.mounted = false

    this.handleChange = this.handleChange.bind(this)
    this.handleKey = this.handleKey.bind(this)
    this.toggleFocus = this.toggleFocus.bind(this)
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
    const host = os
      .hostname()
      .replace(hyphens, ' ')
      .replace('.local', '')
    const userAgent = remote.require('./utils/user-agent')

    const body = JSON.stringify({
      email,
      tokenName: `Now Desktop on ${host}`
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

  componentDidMount() {
    if (!this.remote) {
      return
    }

    const currentWindow = this.remote.getCurrentWindow()

    currentWindow.on('show', () => {
      if (!this.loginInput) {
        return
      }

      this.loginInput.focus()
    })

    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  prepareSuggestion(value) {
    if (value === '') {
      return
    }

    const domain = value.match(/@(.*)/)

    if (domain && domain[1].length > 0) {
      const match = domain[1]
      let sug

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
        const parts = value.trim().split('@')
        const suffix = sug.substr(parts[1].length, sug.length)

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

    this.props.setIntroState({
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

    this.props.setIntroState({
      sendingMail: false,
      security: {
        email,
        code: securityCode
      }
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
    const userData = await loadData(API_USER, finalToken)
    const user = userData.user

    try {
      await saveConfig(
        {
          user: {
            uid: user.uid,
            username: user.username,
            email: user.email
          }
        },
        'config'
      )
    } catch (err) {
      error('Could not save main config', err)
      return
    }

    try {
      await saveConfig(
        {
          provider: 'sh',
          token: finalToken
        },
        'auth'
      )
    } catch (err) {
      error('Could not save auth config', err)
      return
    }

    // Start watching for changes in .now.json
    // This will update the scope in the main window
    watchConfig()

    if (!this.remote) {
      return
    }

    const { main, tutorial } = this.remote.getGlobal('windows')

    // Ensure that the event feed starts fresh
    main.reload()

    // As soon as the event feed has finished reloading,
    // adjust the content of the intro
    main.once('ready-to-show', async () => {
      if (!this.props.setIntroState) {
        return
      }

      this.props.setIntroState({
        security: null,
        done: true
      })

      // Focus on current window so that the user
      // can start the tutorial, now that he's logged in
      tutorial.focus()
    })
  }

  async handleKey(event) {
    this.setState({
      classes: []
    })

    const keyCode = event.keyCode

    // Don't allow using spaces in the input
    if (keyCode === 32) {
      event.preventDefault()
      return
    }

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

      return
    }

    // Don't trigger login if placeholder defined as value
    if (value === initialValue) {
      return
    }

    try {
      await this.tryLogin(value.toLowerCase())
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
      onChange: this.handleChange,
      onKeyDown: this.handleKey,
      onFocus: this.toggleFocus,
      onBlur: this.toggleFocus,
      ref: item => {
        window.loginInputElement = item
        this.loginInput = item
      },
      onClick: event => event.stopPropagation()
    }

    if (classes.indexOf('login') === -1) {
      classes.push('login')
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
      <aside {...autoCompleteProps}>
        <div>
          <AutoSizeInput {...inputProps} />
          <span
            className={suggestionClass}
            dangerouslySetInnerHTML={{ __html: this.state.suggestion }}
          />
        </div>

        <style jsx global>
          {styles}
        </style>
      </aside>
    )
  }
}

LoginForm.propTypes = {
  setIntroState: func
}

export default LoginForm
