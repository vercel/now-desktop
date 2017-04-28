// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Deployment extends Message {
  render() {
    const { event } = this.props
    const host = event.payload.url

    return (
      <span>
        {this.getDisplayName()}
        deployed{' '}
        <b>{event.payload.name}</b>
        {' '}to{' '}
        <a
          className="link"
          onClick={this.openExternal}
          href={`http://${host}`}
          target="_blank"
        >
          {host}
        </a>
      </span>
    )
  }
}
