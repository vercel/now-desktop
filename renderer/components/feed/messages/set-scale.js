// Packages
import React from 'react'

// Components
import Message from './message'

export default class Scale extends Message {
  render() {
    const { event } = this.props
    const { min, max } = event.payload

    if (min && max) {
      return (
        <p>
          {this.getDisplayName()}
          updated scale rules for{' '}
          <b>{event.payload.url}</b>
          {' '}
          to{' '}
          min: <b>{min}</b>, max: <b>{max}</b>
        </p>
      )
    }

    return (
      <p>
        {this.getDisplayName()}
        updated scale rules for{' '}
        <b>{event.payload.url}</b>
      </p>
    )
  }
}
