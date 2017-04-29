// Packages
import React from 'react'

// Components
import Message from '../message'

export default class DeploymentDelete extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        deleted <b>{event.payload.url}</b>
      </span>
    )
  }
}
