import * as Sentry from '@sentry/browser'
import React from 'react'
import Error from 'next/error'
import PropTypes from 'prop-types'
import pkg from '../../package'

Sentry.init({
  dsn: pkg.sentryDsn
})

class ErrorPage extends React.Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    Sentry.captureException(err)
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
