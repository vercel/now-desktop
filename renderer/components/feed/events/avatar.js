// Packages
import React from 'react'
import { object } from 'prop-types'

class Avatar extends React.Component {
  constructor(props) {
    super(props)

    const { event, team } = props
    let isUser = true

    const teamEvents = ['deployment-unfreeze', 'deployment-freeze']

    if (teamEvents.includes(event.type)) {
      isUser = false
    }

    const id = event.user ? event.user.uid : event.userId
    const imageID = isUser ? id : `?teamId=${team.id}`
    const separator = isUser ? '?' : '&'
    const url = `https://zeit.co/api/www/avatar/${imageID}${separator}s=80`

    // Preload avatar, prevent flickering
    const image = new Image()
    image.src = url

    this.state = {
      url,
      scopeMatched: false
    }
  }

  render() {
    return (
      <div>
        <img src={this.state.url} draggable="false" />

        <style jsx>
          {`
          img {
            height: 30px;
            width: 30px;
            border-radius: 30px;
            margin: 15px 0 0 15px;
          }
        `}
        </style>
      </div>
    )
  }
}

Avatar.propTypes = {
  team: object,
  event: object
}

export default Avatar
