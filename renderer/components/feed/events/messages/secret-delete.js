// Packages
import React from 'react'

// Components
import Message from '../message'

export default class SecretDelete extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        removed secret
        {' '}
        <b>{event.payload.name ? event.payload.name : event.payload.uid}</b>
      </span>
    )
  }
}
