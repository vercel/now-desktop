// Packages
import React from 'react'

// Components
import Message from '../message'

export default class TeamMemberAdd extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        invited user
        {' '}
        <b>{event.payload.invitedUser.username}</b>
      </span>
    )
  }
}
