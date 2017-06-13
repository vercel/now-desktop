// Packages
import React from 'react'

// Components
import Message from './message'

export default class DeploymentFreeze extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        The deployment <b>{event.payload.url}</b> was frozen
      </p>
    )
  }
}
