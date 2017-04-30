// Packages
import React from 'react'

// Components
import Message from '../message'

export default class CertReplace extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        replaced a certificate for
        {' '}
        <b>{event.payload.cn}</b>
      </p>
    )
  }
}
