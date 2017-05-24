// Packages
import React from 'react'
import { object, bool } from 'prop-types'

class Avatar extends React.Component {
  constructor(props) {
    super(props)

    const { event, team } = props

    let isUser = event || props.isUser
    let id

    if (event) {
      const teamEvents = ['deployment-unfreeze', 'deployment-freeze']
      id = event.user ? event.user.uid : event.userId

      if (Object.keys(team).length !== 0 && teamEvents.includes(event.type)) {
        isUser = false
      }
    } else {
      id = team.id
    }

    const imageID = isUser ? id : `?teamId=${team.id}`
    const separator = isUser ? '?' : '&'
    const url = `https://zeit.co/api/www/avatar/${imageID}${separator}s=80`

    // Preload avatar, prevent flickering
    const image = new Image()
    image.src = url

    this.state = { url }
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
