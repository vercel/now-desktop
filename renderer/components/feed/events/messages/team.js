// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Team extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        created team
        {' '}
        <b>{event.payload.slug}</b>
      </span>
    )
  }
}
