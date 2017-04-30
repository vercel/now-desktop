// Packages
import React from 'react'

// Components
import Message from '../message'

export default class TeamMemberAdd extends Message {
  render() {
    const { event } = this.props
    const invitedUser = event.payload.invitedUser
    const username = invitedUser.username || invitedUser.email

    return (
      <p>
        {this.getDisplayName()}
        invited user{invitedUser.username ? '' : ' with email address'}
        {' '}
        <b>{username}</b>
      </p>
    )
  }
}
