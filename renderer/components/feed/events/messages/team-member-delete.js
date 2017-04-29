// Packages
import React from 'react'

// Components
import Message from '../message'

export default class TeamMemberDelete extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        removed user
        {' '}
        <b>{event.payload.deletedUser.username}</b>
      </span>
    )
  }
}
