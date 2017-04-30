// Packages
import React from 'react'

// Components
import Message from '../message'

export default class DeploymentDelete extends Message {
  render() {
    const { event } = this.props

    return (
      <p>
        {this.getDisplayName()}
        deleted <b>{event.payload.url}</b>
      </p>
    )
  }
}
