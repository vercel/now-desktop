// Packages
import React from 'react'

// Components
import Message from './message'

export default class DomainBuy extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        bought the domain <b>{event.payload.name}</b> for ${event.payload.price}{' '}
        (per year)
      </p>
    )
  }
}
