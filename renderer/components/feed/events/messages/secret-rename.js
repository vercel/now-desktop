// Packages
import React from 'react'

// Components
import Message from '../message'

export default class SecretRename extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        renamed secret
        {' '}
        <b>{event.payload.oldName}</b>
        {' '}
        to
        {' '}
        <b>{event.payload.newName}</b>
      </span>
    )
  }
}
