// Packages
import React from 'react'

// Components
import Message from './message'

export default class CertRenew extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        renewed a certificate for <b>{event.payload.cn}</b>
      </p>
    )
  }
}
