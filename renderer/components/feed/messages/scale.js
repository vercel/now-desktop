// Packages
import React from 'react'

// Components
import Message from './message'

export default class Scale extends Message {
  render() {
    const { event } = this.props
    const { instances } = event.payload

    if (event.user) {
      return (
        <p>
          {this.getDisplayName()}
          scaled deployment <b>{event.payload.url}</b> to{' '}
          <b>
            {instances} instance{instances > 1 ? 's' : ''}
          </b>
        </p>
      )
    }

    return (
      <p>
        The deployment <b>{event.payload.deploymentId}</b> was scaled to{' '}
        <b>
          {instances} instance{instances > 1 ? 's' : ''}
        </b>
      </p>
    )
  }
}
