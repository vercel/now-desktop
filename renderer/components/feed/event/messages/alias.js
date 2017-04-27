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
        <span>
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
          <a href={`https://${event.payload.alias}`}>
            https://{event.payload.alias}
          </a>
        </span>
      )
    }

    const host = event.payload.deploymentUrl

    // `host` can be `id` on old events
    const hostParts = event.payload.deploymentUrl.match(
      /^(.+)-([^-]+)\.now\.sh$/
    )
    const [, app, id] = hostParts || []

    const handle = team ? team.slug : user.username
    const userId = user.uid
    return (
      <span>
        {this.getDisplayName()}
        aliased
        {' '}
        {hostParts
          ? [
              <a
                key="deployment"
                href={`/deployment?${qs.stringify({ handle, userId, host })}`}
                as={`/${encodeURIComponent(handle || userId)}/${encodeURIComponent(app)}/${encodeURIComponent(id)}`}
              >
                {host}
              </a>,
              <a
                className="external"
                key="external"
                href={`http://${host}`}
                target="_blank"
              >
                test
              </a>
            ]
          : host}
        {' '}
        to
        {' '}
        <a href={`https://${event.payload.alias}`}>
          https://{event.payload.alias}
        </a>
      </span>
    )
  }
}
