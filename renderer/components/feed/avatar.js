// Packages
import React from 'react'
import { object, bool } from 'prop-types'

class Avatar extends React.Component {
  constructor(props) {
    super(props)

    // Retrieve the URL of the avatar image
    const url = this.getURL()

    // Preload avatar, prevent flickering
    const image = new Image()
    image.src = url

    this.state = { url }
  }

  getURL() {
    const { event, team } = this.props

    const teamEvents = [
      'deployment-unfreeze',
      'deployment-freeze',
      'scale-auto'
    ]

    let isUser = event || this.props.isUser
    let id

    if (event) {
      id = event.user ? event.user.uid : event.userId

      if (Object.keys(team).length !== 0 && teamEvents.includes(event.type)) {
        isUser = false
      }
    } else {
      id = team.id
    }

    const imageID = isUser ? id : `?teamId=${team.id}`
    const separator = isUser ? '?' : '&'

    return `https://zeit.co/api/www/avatar/${imageID}${separator}s=80`
  }

  render() {
    const classes = this.props.event ? 'in-event' : ''

    return (
      <div>
        <img src={this.state.url} draggable="false" className={classes} />

        <style jsx>
          {`
          img {
            height: 30px;
            width: 30px;
            border-radius: 30px;
          }

          .in-event {
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
  event: object,
  isUser: bool
}

export default Avatar
