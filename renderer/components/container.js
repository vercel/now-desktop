// Packages
import React from 'react'
import Head from 'next/head'
import PropTypes from 'prop-types'

const Container = ({ children }) =>
  <section>
    {children}

    <Head>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        ::selection {
          background: #A7D8FF;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Helvetica Neue, sans-serif;
          -webkit-font-smoothing: antialiased;
          -webkit-app-region: drag;
          -webkit-user-select: none;
          margin: 0;
        }
      `
        }}
      />
    </Head>
  </section>

Container.propTypes = {
  children: PropTypes.element.isRequired
}

export default Container
