// Packages
import React from 'react'

// Components
import Message from '../message'

export default class AliasDelete extends Message {
  render() {
    const { event } = this.props
    return (
      <span>
        {this.getDisplayName()}
        removed alias https://{event.payload.alias}
      </span>
    )
  }
}
