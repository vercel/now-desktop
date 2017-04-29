// Packages
import React from 'react'

// Components
import Message from '../message'

export default class TeamNameUpdate extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        updated team name to
        {' '}
        <b>{event.payload.name}</b>
      </span>
    )
  }
}
