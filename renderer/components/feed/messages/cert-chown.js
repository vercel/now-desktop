// Packages
import React from 'react'

// Components
import Message from '../message'

export default class CertChown extends Message {
  render() {
    const { event } = this.props
    return (
      <span>
        {this.getDisplayName()}
        changed the ownership of cert{' '}
        <b>{event.payload.id}</b>
        {event.payload.oldTeam ? ` from {event.payload.oldTeam.name}` : ''}
        {' '}to {event.payload.newTeam.name}
      </span>
    )
  }
}
