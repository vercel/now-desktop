// Packages
import React from 'react'
import { object, bool } from 'prop-types'

class Avatar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      url: null,
      title: null
    }
  }

  componentWillMount() {
    const isUser = this.isUser()

    this.setURL(isUser)
    this.setTitle(isUser)
  }

  isUser() {
    const { event, team } = this.props
    let right = event || this.props.isUser

    if (event) {
      const teamEvents = [
        'deployment-unfreeze',
        'deployment-freeze',
        'scale-auto'
      ]

      if (Object.keys(team).length !== 0 && teamEvents.includes(event.type)) {
        right = false
      }
    }

    return right
  }

  async setURL(isUser) {
    const { event, team } = this.props
    let id

    if (event) {
      id = event.user ? event.user.uid : event.userId
    } else {
      id = team.id
    }

    const imageID = isUser ? id : `?teamId=${team.id}`
    const separator = isUser ? '?' : '&'

    this.setState({
      url: `https://zeit.co/api/www/avatar/${imageID}${separator}s=80`
    })
  }

  async setTitle(isUser) {
    const { event, team } = this.props
    let title

    if (event && event.user) {
      title = event.user.username
    }

    if ((team && !isUser) || (!event && isUser)) {
      title = team.name || team.id
    }

    this.setState({ title })
  }

  render() {
    const classes = this.props.event ? 'in-event' : ''

    return (
      <div>
        <img
          src={this.state.url}
          title={this.state.title}
          draggable="false"
          className={classes}
        />

        <style jsx>
          {`
          img {
            height: 23px;
            width: 23px;
            border-radius: 23px;
          }

          .in-event {
            margin: 10px 10px 0 10px;
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
