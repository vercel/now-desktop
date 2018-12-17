import * as Sentry from '@sentry/electron'
import React from 'react'
import Error from 'next/error'
import PropTypes from 'prop-types'
import isDev from 'electron-is-dev'
import pkg from '../../package'

if (!isDev) {
  Sentry.init({
    dsn: 'https://d07ceda63dd8414e9c403388cfbd18fe@sentry.io/1323140',
    environment: pkg.includes('canary') ? 'canary' : 'stable',
    release: `now-desktop@${pkg.version}`
  })
}

class ErrorPage extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null

    if (!isDev) {
      Sentry.captureException(err)
    }

    return { statusCode }
  }

  render() {
    return <Error statusCode={this.props.statusCode} />
  }
}

ErrorPage.propTypes = {
  statusCode: PropTypes.number
}

export default ErrorPage
