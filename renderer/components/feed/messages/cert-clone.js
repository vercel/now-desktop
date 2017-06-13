// Packages
import React from 'react'

// Components
import Message from './message'

export default class CertClone extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        cloned a certificate
        {' '}
        <b>
          {event.payload.src}
        </b>
        to
        <b>
          {event.payload.dst}
        </b>
      </p>
    )
  }
}
