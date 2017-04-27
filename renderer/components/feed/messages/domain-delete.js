// Packages
import React from 'react'

// Components
import Message from '../message'

export default class DomainDelete extends Message {
  render() {
    const { event } = this.props
    return (
      <span>
        {this.getDisplayName()}
        removed domain
        {' '}
        <b>{event.payload.name}</b>
      </span>
    )
  }
}
