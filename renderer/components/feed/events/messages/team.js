// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Team extends Message {
  render() {
    const { event, team } = this.props
    const teamSlug = event.payload.slug

    if (teamSlug === team.slug) {
      return (
        <p>
          {this.getDisplayName()}
          created this team
        </p>
      )
    }

    return (
      <p>
        {this.getDisplayName()}
        created team
        {' '}
        <b>{event.payload.slug}</b>
      </p>
    )
  }
}
