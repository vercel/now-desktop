// Packages
import React from 'react'

// Components
import Message from '../message'

export default class CertRenew extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        renewed a certificate for
        {' '}
        <b>{event.payload.cn}</b>
      </span>
    )
  }
}
