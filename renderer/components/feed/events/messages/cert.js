// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Cert extends Message {
  render() {
    const { event } = this.props
    return (
      <span>
        {this.getDisplayName()}
        created a certificate for
        {' '}
        <b>
          {event.payload.cn}
        </b>
      </span>
    )
  }
}
