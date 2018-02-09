// Packages
import React from 'react'
import { object } from 'prop-types'

class Message extends React.PureComponent {
  getDisplayName() {
    const { event, user } = this.props

    let isCurrentUser = false

    if (event.userId && event.userId === user.uid) {
      isCurrentUser = true
    }

    if (event.user && event.user.uid && event.user.uid === user.uid) {
      isCurrentUser = true
    }

    if (isCurrentUser) {
      return [<b key="you">You</b>, ' ']
    }

    if (event.user.username) {
      return [<b key="username">{event.user.username}</b>, ' ']
    }

    return [<b key="username">{event.user.email}</b>, ' ']
  }
}

Message.propTypes = {
  event: object,
  user: object,
  team: object
}

export default Message
