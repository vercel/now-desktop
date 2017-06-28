// Packages
import React from 'react'

// Styles
import introStyles from '../../styles/components/tutorial/intro'

// Components
import Button from './button'

const End = () =>
  <article>
    <p><b>That was the tutorial!</b></p>

    <p className="has-mini-spacing">
      Are you ready to
      deploy something now? If so, simply click the
      button below to view the event feed:
    </p>

    <Button>Get Started</Button>
    <style jsx>{introStyles}</style>
  </article>

export default End
