// Packages
import React from 'react'

// Components
import Message from '../message'

export default class TeamMemberDelete extends Message {
  render() {
    const { event } = this.props
    const deletedUser = event.payload.deletedUser
    const username = deletedUser.username || deletedUser.email

    return (
      <p>
        {this.getDisplayName()}
        removed user{deletedUser.username ? '' : ' with email address'}
        {' '}
        <b>{username}</b>
      </p>
    )
  }
}
