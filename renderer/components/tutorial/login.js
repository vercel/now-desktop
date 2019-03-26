import { stringify as stringifyQuery } from 'query-string'
import AutoSizeInput from 'react-input-autosize'
import { PureComponent } from 'react'
import sleep from 'sleep-promise'
import { func } from 'prop-types'
import error from '../../utils/error'
import emailProviders from '../../utils/email-providers'
import styles from '../../styles/components/tutorial/login'

const defaultState = {
  value: '',
  focus: false,
  classes: [],
  suggestion: '',
  waiting: false
}

class LoginForm extends PureComponent {
  state = defaultState
  initialState = Object.assign({}, defaultState)

  mounted = false

  async verify(url, email, token) {
    const query = {
      email,
      token
    }

    const apiURL = url + '/now/registration/verify?' + stringifyQuery(query)

    const res = await fetch(apiURL, {
      headers: {
        'user-agent': 'Now Desktop'
      }
    })

    const body = await res.json()
    const badRequest = res.status === 400

    if (badRequest && body.error && body.error.code === 'invalid_email') {
      const error = new Error(body.error.message)
      error.code = 'invalid_email'
      throw error
    }

    return body.token
  }

  async getVerificationData(url, email) {
    const body = JSON.stringify({
      email,
      tokenName: `Now Desktop`
    })

    const apiURL = `${url}/now/registration`

    const res = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(body).length,
        'user-agent': 'Now Desktop'
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

  handleChange = event => {
    const value = event.target.value

    this.setState({
      value
    })

    this.prepareSuggestion(value)
  }

  showWindow = () => {
    if (!this.loginInput) {
      return
    }

    this.loginInput.focus()
  }

  componentDidMount() {
    this.mounted = true

    window.addEventListener('beforeunload', () => {
      // Show the window here
    })
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
    const onlineStatus = 'online'

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
      email
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

    do {
      await sleep(2500)

      try {
        finalToken = await this.verify(apiURL, email, token)
      } catch (err) {
        if (err.code === 'invalid_email') {
          error(err.message, err)
        } else {
          error('Failed to verify login. Please retry later.', err)
        }

        this.props.setIntroState({
          classes: [],
          security: null
        })

        return
      }

      console.log('Waiting for token...')
    } while (!finalToken)
  }

  handleKey = async event => {
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

  toggleFocus = () => {
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
