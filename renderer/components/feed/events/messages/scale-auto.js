// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Scale extends Message {
  render() {
    const { event } = this.props
    const { instances } = event.payload

    return (
      <p>
        The deployment
        {' '}
        <b>{event.payload.deploymentId}</b>
        {' '}
        was auto-scaled to
        {' '}
        <b>{instances} instance{instances > 1 ? 's' : ''}</b>
      </p>
    )
  }
}
