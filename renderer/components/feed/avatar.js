// Packages
import React from 'react'
import { object, bool, number } from 'prop-types'

class Avatar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      url: null,
      title: null,
      scaled: false
    }
  }

  componentWillMount() {
    const isUser = this.isUser()

    this.setURL(isUser)
    this.setTitle(isUser)
  }

  componentDidMount() {
    if (!this.props.scale) {
      return
    }

    if (!this.state.scaled) {
      this.prepareScale(this.props.delay)
    }
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

  prepareScale(delay) {
    const when = 100 + 250 * delay

    setTimeout(() => {
      this.setState({
        scaled: true
      })
    }, when)
  }

  render() {
    let classes = this.props.event ? 'in-event' : ''

    if (this.props.scale) {
      classes += ' scale'
    }

    if (this.state.scaled) {
      classes += ' scaled'
    }

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

          .scale {
            transform: scale(0);
            transition: all 0.6s;
          }

          .scaled {
            transform: scale(1);
          }

          .in-event {
            margin: 8px 10px 0 10px;
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
  isUser: bool,
  scale: bool,
  delay: number
}

export default Avatar
