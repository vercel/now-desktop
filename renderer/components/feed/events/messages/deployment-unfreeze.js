// Packages
import React from 'react'

// Components
import Message from '../message'

export default class DeploymentUnfreeze extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        {' '}
        unfreezed the deployment
        {' '}
        <b>{event.payload.url}</b>
      </p>
    )
  }
}
