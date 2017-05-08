// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Scale extends Message {
  render() {
    const { event } = this.props

    if (event.user) {
      return (
        <p>
          {this.getDisplayName()}
          scaled deployment{' '}
          <b>
            {event.payload.url}
          </b>
          {' '}
          to <b>{event.payload.instances} instances</b>
        </p>
      )
    }

    return (
      <p>
        Deployment
        {' '}
        <b>{event.payload.deploymentId}</b>
        {' '}
        was scaled to
        {' '}
        <b>{event.payload.instances} instances</b>
      </p>
    )
  }
}
