// Packages
import React from 'react'

// Components
import Message from '../message'

export default class TeamSlugUpdate extends Message {
  render() {
    const { event } = this.props

    return (
      <span>
        {this.getDisplayName()}
        updated team url to
        {' '}
        <b>{event.payload.slug}</b>
      </span>
    )
  }
}
