// Packages
import React from 'react'
import { object } from 'prop-types'

class Message extends React.PureComponent {
  getDisplayName() {
    const { event, user } = this.props

    let isCurrentUser = false

    if (event.user_id && event.user_id === user.uid) {
      isCurrentUser = true
    }

    if (event.user && event.user.uid && event.user.uid === user.uid) {
      isCurrentUser = true
    }

    if (isCurrentUser) {
      return [<b key="you">You</b>, ' ']
    }

    return [<b key="username">{event.user.username}</b>, ' ']
  }
}

Message.propTypes = {
  event: object,
  user: object,
  team: object
}

export default Message
