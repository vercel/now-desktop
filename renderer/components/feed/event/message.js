// Packages
import React from 'react'
import { object } from 'prop-types'

class Message extends React.PureComponent {
  getDisplayName() {
    const { event, user } = this.props

    if (event.user_id || event.user.uid === user.uid) {
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
