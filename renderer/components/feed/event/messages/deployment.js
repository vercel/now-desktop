// Native
import qs from 'querystring'

// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Deployment extends Message {
  render() {
    const { event, user, team } = this.props
    const host = event.payload.url
    const [, app, id] = host.match(/^(.+)-([^-]+)\.now\.sh$/) || []
    const handle = team ? team.slug : user.username
    const userId = user.uid

    return (
      <span>
        {this.getDisplayName()}
        deployed{' '}
        <b>{event.payload.name}</b>
        {' '}to{' '}
        <a
          href={`/deployment?${qs.stringify({ handle, userId, host })}`}
          as={`/${encodeURIComponent(handle || userId)}/${encodeURIComponent(app)}/${encodeURIComponent(id)}`}
        >
          {host}
        </a>
        <a className="external" href={`http://${host}`} target="_blank">
          test
        </a>
      </span>
    )
  }
}
