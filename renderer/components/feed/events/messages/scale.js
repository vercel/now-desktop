// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Scale extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        Deployment
        {' '}
        <b>{event.payload.deploymentId}</b>
        {' '}
        was scaled to
        {' '}
        <b>{event.payload.instances} instances</b>
      </span>
    )
  }
}
