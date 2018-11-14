import React from 'react'
import App, { Container } from 'next/app'
import * as Sentry from '@sentry/electron'

Sentry.init({
  dsn: 'https://d07ceda63dd8414e9c403388cfbd18fe@sentry.io/1323140'
})

export default class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render() {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Component {...pageProps} />
      </Container>
    )
  }
}
