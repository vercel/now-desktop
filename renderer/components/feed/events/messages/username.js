// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Username extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        set username to
        {' '}
        <b>{event.payload.username}</b>
      </span>
    )
  }
}
