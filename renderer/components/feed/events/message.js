// Packages
import React from 'react'
import { object } from 'prop-types'

// Utilities
import remote from '../../../utils/electron'

class Message extends React.PureComponent {
  getDisplayName() {
    const { event, user } = this.props

    let isCurrentUser = false

    if (event.userId && event.userId === user.userId) {
      isCurrentUser = true
    }

    if (event.user && event.user.uid && event.user.uid === user.userId) {
      isCurrentUser = true
    }

    if (isCurrentUser) {
      return [<b key="you">You</b>, ' ']
    }

    return [<b key="username">{event.user.username}</b>, ' ']
  }

  openExternal(event) {
    event.preventDefault()
    const href = event.target.href

    remote.shell.openExternal(href)
  }
}

Message.propTypes = {
  event: object,
  user: object,
  team: object
}

export default Message
