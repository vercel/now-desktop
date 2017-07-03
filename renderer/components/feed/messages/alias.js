// Packages
import React from 'react'

// Components
import Message from './message'

export default class Alias extends Message {
  render() {
    const { event } = this.props

    // NOTE: no `ruleCount` on old logs
    if (event.payload.ruleCount !== null || !event.payload.deploymentUrl) {
      return (
        <p>
          {this.getDisplayName()}
          configured {event.payload.ruleCount} alias rule
          {event.payload.ruleCount === null || event.payload.ruleCount > 1
            ? 's'
            : ''}{' '}
          for <b>{event.payload.alias}</b>
        </p>
      )
    }

    return (
      <p>
        {this.getDisplayName()}
        aliased <b>{event.payload.deploymentUrl}</b> to{' '}
        <b>{event.payload.alias}</b>
      </p>
    )
  }
}
