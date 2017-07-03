// Packages
import React from 'react'

// Components
import Message from './message'

export default class DnsDelete extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        removed a DNS record {event.payload.id} of <b>{event.payload.domain}</b>
      </p>
    )
  }
}
