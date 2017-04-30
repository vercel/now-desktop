// Native
import qs from 'querystring'

// Packages
import React from 'react'

// Components
import Message from '../message'

export default class Alias extends Message {
  render() {
    const { event, user, team } = this.props

    // NOTE: no `ruleCount` on old logs
    if (event.payload.ruleCount !== null || !event.payload.deploymentUrl) {
      return (
        <p>
          {this.getDisplayName()}
          configured
          {' '}
          {event.payload.ruleCount}
          {' '}
          alias rule
          {event.payload.ruleCount === null || event.payload.ruleCount > 1
            ? 's'
            : ''}
          {' '}
          for
          {' '}
          <a
            className="link"
            onClick={this.openExternal}
            href={`https://${event.payload.alias}`}
          >
            {event.payload.alias}
          </a>
        </p>
      )
    }

    const host = event.payload.deploymentUrl

    // `host` can be `id` on old events
    const hostParts = event.payload.deploymentUrl.match(
      /^(.+)-([^-]+)\.now\.sh$/
    )
    const [, app, id] = hostParts || []

    const handle = team ? team.slug : user.username
    const userId = user.userId

    return (
      <p>
        {this.getDisplayName()}
        aliased
        {' '}
        {hostParts
          ? <a
              key="deployment"
              className="link"
              onClick={this.openExternal}
              href={`/deployment?${qs.stringify({ handle, userId, host })}`}
              as={`/${encodeURIComponent(handle || userId)}/${encodeURIComponent(app)}/${encodeURIComponent(id)}`}
            >
              {host}
            </a>
          : <b>host</b>}
        {' '}
        to
        {' '}
        <a
          className="link"
          onClick={this.openExternal}
          href={`https://${event.payload.alias}`}
        >
          https://{event.payload.alias}
        </a>
      </p>
    )
  }
}
