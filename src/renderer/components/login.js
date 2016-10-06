// Packages
import {stringify as stringifyQuery} from 'querystring'
import React from 'react'
import autoSizeInput from 'autosize-input'
import Config from 'electron-config'
import {remote} from 'electron'

// Ours
import error from '../utils/error'
import startRefreshment from '../utils/refresh'
import saveToCLI from '../utils/token/to-cli'

const domains = [
  'aol.com',
  'gmail.com',
  'google.com',
  'yahoo.com',
  'ymail.com',
  'hotmail.com',
  'live.com',
  'outlook.com',
  'inbox.com',
  'mail.com',
  'gmx.com',
  'icloud.com'
]

const getVerificationToken = async (url, email) => {
  const os = remote.require('os')
  const hyphens = new RegExp('-', 'g')
  const host = os.hostname().replace(hyphens, ' ').replace('.local', '')

  const body = JSON.stringify({
    email,
    tokenName: 'Now on ' + host
  })

  const apiURL = `${url}/now/registration`

  const res = await fetch(apiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(body).length
    },
    body
  })

  if (res.status !== 200) {
    error('Verification error', res.json())
    return
  }

  const content = await res.json()
  return content.token
}

const verify = async (url, email, token) => {
  const query = {
    email,
    token
  }

  const apiURL = url + '/now/registration/verify?' + stringifyQuery(query)
  const res = await fetch(apiURL)

  const body = await res.json()
  return body.token
}

const sleep = ms => new Promise(resolve => {
  setTimeout(resolve, ms)
})

export default React.createClass({
  getInitialState() {
    return {
      value: '',
      focus: false,
      classes: [],
      suggestion: '',
      waiting: false
    }
  },
  handleChange(event) {
    const value = event.target.value

    this.setState({
      value
    })

    this.prepareSuggestion(value)
  },
  async tryLogin(email) {
    const onlineStatus = remote.process.env.CONNECTION

    if (onlineStatus === 'offline') {
      error('You\'re offline!')
      return
    }

    if (this.state.waiting) {
      return
    }

    this.setState({
      waiting: true
    })

    const apiURL = 'https://api.zeit.co'
    const verificationToken = await getVerificationToken(apiURL, email)

    if (!verificationToken) {
      this.setState({
        waiting: false
      })

      return
    }

    window.sliderElement.setState({
      loginText: `We sent an email to <strong>${email}</strong>.<br>Please follow the link within it.`
    })

    this.setState({
      classes: [
        'verifying'
      ]
    })

    let final

    do {
      await sleep(2500)

      try {
        final = await verify(apiURL, email, verificationToken)
      } catch (err) {}

      console.log('Waiting for token...')
    } while (!final)

    const config = new Config()

    // Save user information to consistant configuration
    config.set('now.user.email', email)
    config.set('now.user.token', final)

    // Also save it to now.json
    await saveToCLI(email, final)

    const currentWindow = remote.getCurrentWindow()

    // Load fresh data and auto-update it
    await startRefreshment(currentWindow)

    if (currentWindow) {
      currentWindow.focus()
    }

    window.sliderElement.setState({
      loginShown: false,
      loginText: 'Congratulations! <strong>You\'re now signed in.</strong>\nAre you ready for deploying something? Then click the button:'
    })
  },
  componentWillUnmount() {
    if (!this.apiRequest) {
      return
    }

    this.apiRequest.abort()
  },
  prepareSuggestion(value) {
    if (value === '') {
      return
    }

    const domain = value.match(/@(.*)/)

    if (domain && domain[1].length) {
      const match = domain[1]
      let sug

      domains.some(dm => {
        // don't suggest if complete match
        if (match.toLowerCase() === dm.substr(0, match.length) && match !== dm) {
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
  },
  async handleKey(event) {
    this.setState({
      classes: []
    })

    const keyCode = event.keyCode

    const isEnter = keyCode === 13
    const initialValue = this.getInitialState().value

    if (initialValue === this.state.value && !isEnter) {
      this.setState({
        value: ''
      })
    }

    const suggestion = this.state.suggestion

    if (suggestion && (
      keyCode === 39 /* right */ ||
      keyCode === 9 /* tab */ ||
      isEnter /* enter */
    )) {
      // Strip HTML tags and set value
      this.setState({
        value: suggestion.replace(/(<([^>]+)>)/ig, ''),
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
        classes: [
          'error'
        ]
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
      error('Not able to retrieve verification token')
      return
    }
  },
  toggleFocus() {
    this.setState({
      focus: !this.state.focus
    })

    // If input is empty, bring placeholder back
    if (this.state.focus && this.state.value === '') {
      this.setState({
        value: this.getInitialState().value
      })
    }
  },
  initializeAutoSize() {
    const input = this.loginInput

    autoSizeInput(input, {
      minWidth: false
    })
  },
  componentDidMount() {
    this.initializeAutoSize()
  },
  componentDidUpdate() {
    this.initializeAutoSize()
  },
  render() {
    const classes = this.state.classes

    const inputProps = {
      type: 'email',
      value: this.state.value,
      placeholder: 'you@youremail.com',
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
      <aside {...autoCompleteProps}>
        <div>
          <input {...inputProps}/>
          <span className={suggestionClass} dangerouslySetInnerHTML={{__html: this.state.suggestion}}/>
        </div>
      </aside>
    )
  }
})
